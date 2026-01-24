#include "win32_window.h"

#include <dwmapi.h>
#include <flutter_windows.h>

#include "resource.h"

namespace {

/// Window attribute that enables dark mode window decorations.
///
/// Redefined in case the developer's machine has a Windows SDK older than
/// version 10.0.22000.0.
/// See: https://docs.microsoft.com/windows/win32/api/dwmapi/ne-dwmapi-dwmwindowattribute
#ifndef DWMWA_USE_IMMERSIVE_DARK_MODE
#define DWMWA_USE_IMMERSIVE_DARK_MODE 20
#endif

constexpr const wchar_t kWindowClassName[] = L"FLUTTER_RUNNER_WIN32_WINDOW";

/// Registry key for app theme preference.
///
/// A value of 0 indicates apps should use dark mode. A non-zero or missing
/// value indicates apps should use light mode.
constexpr const wchar_t kGetPreferredBrightnessRegKey[] =
  L"Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize";
constexpr const wchar_t kGetPreferredBrightnessRegValue[] = L"AppsUseLightTheme";

// The number of Win32Window objects that currently exist.
static int g_active_window_count = 0;

using EnableNonClientDpiScaling = BOOL __stdcall(HWND hwnd);

// Scale helper to convert logical scaler values to physical using passed in
/**
 * @brief Converts a logical integer measurement to physical units using a scale factor.
 *
 * Multiplies `source` by `scale_factor` and returns the result converted to an `int`.
 * The conversion from floating point to integer is performed by truncation.
 *
 * @param source Value in logical units to be scaled.
 * @param scale_factor Scale multiplier where 1.0 preserves the original value.
 * @return int The scaled value converted to `int` (truncated).
 */
int Scale(int source, double scale_factor) {
  return static_cast<int>(source * scale_factor);
}

// Dynamically loads the |EnableNonClientDpiScaling| from the User32 module.
/**
 * @brief Enables non-client DPI scaling for the given window if the OS exposes the API.
 *
 * Attempts to enable non-client DPI scaling on the supplied window handle; if the
 * required API is not available on the running system, this function has no effect.
 *
 * @param hwnd Handle to the window for which to enable non-client DPI scaling.
 */
void EnableFullDpiSupportIfAvailable(HWND hwnd) {
  HMODULE user32_module = LoadLibraryA("User32.dll");
  if (!user32_module) {
    return;
  }
  auto enable_non_client_dpi_scaling =
      reinterpret_cast<EnableNonClientDpiScaling*>(
          GetProcAddress(user32_module, "EnableNonClientDpiScaling"));
  if (enable_non_client_dpi_scaling != nullptr) {
    enable_non_client_dpi_scaling(hwnd);
  }
  FreeLibrary(user32_module);
}

}  // namespace

// Manages the Win32Window's window class registration.
class WindowClassRegistrar {
 public:
  /**
 * @brief Default destructor for WindowClassRegistrar.
 *
 * Ensures proper cleanup of the registrar object when it is destroyed.
 */
~WindowClassRegistrar() = default;

  /**
   * @brief Returns the singleton instance of WindowClassRegistrar.
   *
   * Creates the singleton on first invocation and returns a pointer to it.
   *
   * @return WindowClassRegistrar* Pointer to the singleton WindowClassRegistrar.
   */
  static WindowClassRegistrar* GetInstance() {
    if (!instance_) {
      instance_ = new WindowClassRegistrar();
    }
    return instance_;
  }

  // Returns the name of the window class, registering the class if it hasn't
  // previously been registered.
  const wchar_t* GetWindowClass();

  // Unregisters the window class. Should only be called if there are no
  // instances of the window.
  void UnregisterWindowClass();

 private:
  /**
 * @brief Default constructor.
 *
 * Private default constructor used to enforce the singleton lifetime of WindowClassRegistrar.
 */
WindowClassRegistrar() = default;

  static WindowClassRegistrar* instance_;

  bool class_registered_ = false;
};

WindowClassRegistrar* WindowClassRegistrar::instance_ = nullptr;

/**
 * @brief Returns the window class name, registering the window class on first use.
 *
 * If the window class has not yet been registered, registers it with the process
 * and marks it as registered before returning the class name.
 *
 * @return const wchar_t* The window class name (`kWindowClassName`).
 */
const wchar_t* WindowClassRegistrar::GetWindowClass() {
  if (!class_registered_) {
    WNDCLASS window_class{};
    window_class.hCursor = LoadCursor(nullptr, IDC_ARROW);
    window_class.lpszClassName = kWindowClassName;
    window_class.style = CS_HREDRAW | CS_VREDRAW;
    window_class.cbClsExtra = 0;
    window_class.cbWndExtra = 0;
    window_class.hInstance = GetModuleHandle(nullptr);
    window_class.hIcon =
        LoadIcon(window_class.hInstance, MAKEINTRESOURCE(IDI_APP_ICON));
    window_class.hbrBackground = 0;
    window_class.lpszMenuName = nullptr;
    window_class.lpfnWndProc = Win32Window::WndProc;
    RegisterClass(&window_class);
    class_registered_ = true;
  }
  return kWindowClassName;
}

/**
 * @brief Unregisters the window class used by Win32Window instances.
 *
 * Removes the registered window class identified by kWindowClassName and updates
 * the registrar state to reflect that the class is no longer registered.
 *
 * This should only be called when there are no active windows using the class.
 */
void WindowClassRegistrar::UnregisterWindowClass() {
  UnregisterClass(kWindowClassName, nullptr);
  class_registered_ = false;
}

/**
 * @brief Constructs a Win32Window and increments the global active-window counter.
 *
 * Increments g_active_window_count to record that a new Win32Window instance exists.
 */
Win32Window::Win32Window() {
  ++g_active_window_count;
}

/**
 * @brief Cleans up the Win32Window instance.
 *
 * Decrements the global active window count and destroys the associated native window, performing any necessary cleanup (such as unregistering the window class when this was the last active window).
 */
Win32Window::~Win32Window() {
  --g_active_window_count;
  Destroy();
}

/**
 * @brief Creates a Win32 window for this wrapper and prepares it for use.
 *
 * The window position and size are interpreted in logical (96-DPI) units and
 * are scaled to the monitor's DPI. Any existing window owned by this instance
 * is destroyed before creation. The created window will be associated with
 * this Win32Window instance and have theming applied.
 *
 * @param title Window title text.
 * @param origin Upper-left origin in logical coordinates.
 * @param size Size in logical coordinates.
 * @return bool `true` if the window was created and OnCreate succeeded, `false` if window creation failed.
 */
bool Win32Window::Create(const std::wstring& title,
                         const Point& origin,
                         const Size& size) {
  Destroy();

  const wchar_t* window_class =
      WindowClassRegistrar::GetInstance()->GetWindowClass();

  const POINT target_point = {static_cast<LONG>(origin.x),
                              static_cast<LONG>(origin.y)};
  HMONITOR monitor = MonitorFromPoint(target_point, MONITOR_DEFAULTTONEAREST);
  UINT dpi = FlutterDesktopGetDpiForMonitor(monitor);
  double scale_factor = dpi / 96.0;

  HWND window = CreateWindow(
      window_class, title.c_str(), WS_OVERLAPPEDWINDOW,
      Scale(origin.x, scale_factor), Scale(origin.y, scale_factor),
      Scale(size.width, scale_factor), Scale(size.height, scale_factor),
      nullptr, nullptr, GetModuleHandle(nullptr), this);

  if (!window) {
    return false;
  }

  UpdateTheme(window);

  return OnCreate();
}

/**
 * @brief Shows the window using the normal display state.
 *
 * @return `true` if the window was previously visible, `false` otherwise.
 */
bool Win32Window::Show() {
  return ShowWindow(window_handle_, SW_SHOWNORMAL);
}

/**
 * @brief Window procedure used by the registered window class to route messages to a Win32Window instance.
 *
 * Handles initial creation by associating the native HWND with its Win32Window wrapper, enabling
 * non-client DPI scaling when available, and storing the wrapper pointer for later retrieval.
 * For subsequent messages, it retrieves the associated Win32Window and delegates processing to
 * that instance's MessageHandler; if no instance is associated, it falls back to DefWindowProc.
 *
 * @param window The handle to the window receiving the message.
 * @param message The Windows message identifier.
 * @param wparam Additional message-specific information.
 * @param lparam Additional message-specific information.
 * @return LRESULT The result of message processing: the value returned by MessageHandler when delegated,
 * or the value returned by DefWindowProc otherwise.
 */
LRESULT CALLBACK Win32Window::WndProc(HWND const window,
                                      UINT const message,
                                      WPARAM const wparam,
                                      LPARAM const lparam) noexcept {
  if (message == WM_NCCREATE) {
    auto window_struct = reinterpret_cast<CREATESTRUCT*>(lparam);
    SetWindowLongPtr(window, GWLP_USERDATA,
                     reinterpret_cast<LONG_PTR>(window_struct->lpCreateParams));

    auto that = static_cast<Win32Window*>(window_struct->lpCreateParams);
    EnableFullDpiSupportIfAvailable(window);
    that->window_handle_ = window;
  } else if (Win32Window* that = GetThisFromHandle(window)) {
    return that->MessageHandler(window, message, wparam, lparam);
  }

  return DefWindowProc(window, message, wparam, lparam);
}

/**
 * @brief Processes Win32 window messages for this Win32Window instance.
 *
 * Handles destruction, DPI changes, resize, activation, and colorization/theme change messages,
 * applying appropriate window or child-content adjustments and triggering cleanup or theme updates.
 *
 * @param hwnd The window handle that received the message.
 * @param message The message identifier (e.g., WM_DESTROY, WM_DPICHANGED).
 * @param wparam Additional message-specific information.
 * @param lparam Additional message-specific information.
 * @return LRESULT `0` when the message was handled by this method; otherwise the result of `DefWindowProc`.
 */
LRESULT
Win32Window::MessageHandler(HWND hwnd,
                            UINT const message,
                            WPARAM const wparam,
                            LPARAM const lparam) noexcept {
  switch (message) {
    case WM_DESTROY:
      window_handle_ = nullptr;
      Destroy();
      if (quit_on_close_) {
        PostQuitMessage(0);
      }
      return 0;

    case WM_DPICHANGED: {
      auto newRectSize = reinterpret_cast<RECT*>(lparam);
      LONG newWidth = newRectSize->right - newRectSize->left;
      LONG newHeight = newRectSize->bottom - newRectSize->top;

      SetWindowPos(hwnd, nullptr, newRectSize->left, newRectSize->top, newWidth,
                   newHeight, SWP_NOZORDER | SWP_NOACTIVATE);

      return 0;
    }
    case WM_SIZE: {
      RECT rect = GetClientArea();
      if (child_content_ != nullptr) {
        // Size and position the child window.
        MoveWindow(child_content_, rect.left, rect.top, rect.right - rect.left,
                   rect.bottom - rect.top, TRUE);
      }
      return 0;
    }

    case WM_ACTIVATE:
      if (child_content_ != nullptr) {
        SetFocus(child_content_);
      }
      return 0;

    case WM_DWMCOLORIZATIONCOLORCHANGED:
      UpdateTheme(hwnd);
      return 0;
  }

  return DefWindowProc(window_handle_, message, wparam, lparam);
}

/**
 * @brief Destroys the window and performs cleanup.
 *
 * Calls OnDestroy(), destroys the associated HWND if present and clears the handle,
 * and when no active Win32Window instances remain unregisters the window class.
 */
void Win32Window::Destroy() {
  OnDestroy();

  if (window_handle_) {
    DestroyWindow(window_handle_);
    window_handle_ = nullptr;
  }
  if (g_active_window_count == 0) {
    WindowClassRegistrar::GetInstance()->UnregisterWindowClass();
  }
}

/**
 * @brief Retrieves the Win32Window wrapper associated with a native HWND.
 *
 * @param window Native window handle to query.
 * @return Win32Window* Pointer to the associated Win32Window, or `nullptr` if no association exists.
 */
Win32Window* Win32Window::GetThisFromHandle(HWND const window) noexcept {
  return reinterpret_cast<Win32Window*>(
      GetWindowLongPtr(window, GWLP_USERDATA));
}

/**
 * @brief Sets and hosts a child window inside this Win32Window.
 *
 * Reparents the provided window into this window, resizes and moves it to
 * cover the current client area, and gives it input focus.
 *
 * @param content Handle to the child window to attach and display within this window.
 */
void Win32Window::SetChildContent(HWND content) {
  child_content_ = content;
  SetParent(content, window_handle_);
  RECT frame = GetClientArea();

  MoveWindow(content, frame.left, frame.top, frame.right - frame.left,
             frame.bottom - frame.top, true);

  SetFocus(child_content_);
}

/**
 * @brief Retrieves the window's client-area rectangle.
 *
 * @return RECT The client-area rectangle in client coordinates; fields are left, top, right, and bottom
 *               (origin typically at 0,0). */
RECT Win32Window::GetClientArea() {
  RECT frame;
  GetClientRect(window_handle_, &frame);
  return frame;
}

/**
 * @brief Retrieves the native Win32 window handle associated with this wrapper.
 *
 * @return HWND The window handle, or `nullptr` if the window has not been created or has been destroyed.
 */
HWND Win32Window::GetHandle() {
  return window_handle_;
}

/**
 * @brief Sets whether closing this window should terminate the application.
 *
 * @param quit_on_close If `true`, the window will post a quit message when destroyed; if `false`, destroying the window will not post a quit message.
 */
void Win32Window::SetQuitOnClose(bool quit_on_close) {
  quit_on_close_ = quit_on_close;
}

/**
 * @brief Called after the native window has been created to perform initialization.
 *
 * The default implementation performs no action. Subclasses may override to
 * run setup logic that requires a valid window handle.
 *
 * @return `true` if initialization succeeded, `false` otherwise.
 */
bool Win32Window::OnCreate() {
  // No-op; provided for subclasses.
  return true;
}

/**
 * @brief Hook invoked when the window is being destroyed.
 *
 * Called during the window destruction sequence; override in subclasses to perform
 * cleanup or teardown work specific to derived window implementations.
 */
void Win32Window::OnDestroy() {
  // No-op; provided for subclasses.
}

/**
 * @brief Applies the user's preferred app theme (light or dark) to the specified window.
 *
 * Reads the `AppsUseLightTheme` value from the current user's registry key and, if present,
 * enables or disables immersive dark mode for the provided window via `DwmSetWindowAttribute`.
 *
 * @param window Handle to the window whose theme should be updated.
 */
void Win32Window::UpdateTheme(HWND const window) {
  DWORD light_mode;
  DWORD light_mode_size = sizeof(light_mode);
  LSTATUS result = RegGetValue(HKEY_CURRENT_USER, kGetPreferredBrightnessRegKey,
                               kGetPreferredBrightnessRegValue,
                               RRF_RT_REG_DWORD, nullptr, &light_mode,
                               &light_mode_size);

  if (result == ERROR_SUCCESS) {
    BOOL enable_dark_mode = light_mode == 0;
    DwmSetWindowAttribute(window, DWMWA_USE_IMMERSIVE_DARK_MODE,
                          &enable_dark_mode, sizeof(enable_dark_mode));
  }
}
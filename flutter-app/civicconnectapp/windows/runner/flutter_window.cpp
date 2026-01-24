#include "flutter_window.h"

#include <optional>

#include "flutter/generated_plugin_registrant.h"

/**
     * @brief Constructs a FlutterWindow and stores the Dart project used to initialize the Flutter engine and view.
     *
     * @param project Dart project configuration used when creating the FlutterViewController.
     */
    FlutterWindow::FlutterWindow(const flutter::DartProject& project)
    : project_(project) {}

/**
 * @brief Destroys the FlutterWindow and releases owned resources.
 *
 * Ensures any members owned by the instance are cleaned up when the object
 * is destroyed.
 */
FlutterWindow::~FlutterWindow() {}

/**
 * @brief Creates and initializes the Flutter view controller and embeds it in the window.
 *
 * Creates a FlutterViewController sized to the window's client area, validates the controller,
 * registers plugins, sets the Flutter view as the window's child content, schedules the window
 * to be shown after the next rendered frame, and forces a redraw to ensure a pending first frame.
 *
 * @return `true` if the window and Flutter controller were successfully created and initialized, `false` otherwise.
 */
bool FlutterWindow::OnCreate() {
  if (!Win32Window::OnCreate()) {
    return false;
  }

  RECT frame = GetClientArea();

  // The size here must match the window dimensions to avoid unnecessary surface
  // creation / destruction in the startup path.
  flutter_controller_ = std::make_unique<flutter::FlutterViewController>(
      frame.right - frame.left, frame.bottom - frame.top, project_);
  // Ensure that basic setup of the controller was successful.
  if (!flutter_controller_->engine() || !flutter_controller_->view()) {
    return false;
  }
  RegisterPlugins(flutter_controller_->engine());
  SetChildContent(flutter_controller_->view()->GetNativeWindow());

  flutter_controller_->engine()->SetNextFrameCallback([&]() {
    this->Show();
  });

  // Flutter can complete the first frame before the "show window" callback is
  // registered. The following call ensures a frame is pending to ensure the
  // window is shown. It is a no-op if the first frame hasn't completed yet.
  flutter_controller_->ForceRedraw();

  return true;
}

/**
 * @brief Cleans up the window's Flutter resources and performs base-class destruction.
 *
 * Releases the owned FlutterViewController, if present, and then calls the base
 * class OnDestroy to complete window teardown.
 */
void FlutterWindow::OnDestroy() {
  if (flutter_controller_) {
    flutter_controller_ = nullptr;
  }

  Win32Window::OnDestroy();
}

/**
 * @brief Handles Win32 window messages, delegating to the Flutter controller when available.
 *
 * Delegates the message to the FlutterViewController (and plugins) first; if the controller
 * handles the message, its result is returned immediately. If not, performs any window-level
 * handling required by the runner (e.g., reload system fonts on `WM_FONTCHANGE`) and then
 * falls back to the base window message handler.
 *
 * @param hwnd Handle to the window that received the message.
 * @param message The Win32 message identifier.
 * @param wparam Additional message information (message-specific).
 * @param lparam Additional message information (message-specific).
 * @return LRESULT Value resulting from message processing: the controller-provided result if
 * the Flutter controller handled the message, otherwise the value returned by the base handler.
 */
LRESULT
FlutterWindow::MessageHandler(HWND hwnd, UINT const message,
                              WPARAM const wparam,
                              LPARAM const lparam) noexcept {
  // Give Flutter, including plugins, an opportunity to handle window messages.
  if (flutter_controller_) {
    std::optional<LRESULT> result =
        flutter_controller_->HandleTopLevelWindowProc(hwnd, message, wparam,
                                                      lparam);
    if (result) {
      return *result;
    }
  }

  switch (message) {
    case WM_FONTCHANGE:
      flutter_controller_->engine()->ReloadSystemFonts();
      break;
  }

  return Win32Window::MessageHandler(hwnd, message, wparam, lparam);
}
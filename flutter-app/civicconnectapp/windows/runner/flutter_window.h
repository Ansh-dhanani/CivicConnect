#ifndef RUNNER_FLUTTER_WINDOW_H_
#define RUNNER_FLUTTER_WINDOW_H_

#include <flutter/dart_project.h>
#include <flutter/flutter_view_controller.h>

#include <memory>

#include "win32_window.h"

/**
 * Hosts a Flutter view inside a Win32 window.
 *
 * This window's sole purpose is to create and manage a FlutterViewController
 * that renders a Flutter DartProject within a native Win32 window.
 */

/**
 * Creates a new FlutterWindow that will run the given Dart project.
 *
 * @param project The Flutter Dart project to load and execute in the window.
 */

/**
 * Destroys the FlutterWindow and releases associated resources.
 */

/**
 * Performs window creation tasks and initializes the hosted Flutter view.
 *
 * @returns `true` if the window and Flutter view were created successfully, `false` otherwise.
 */

/**
 * Cleans up Flutter-related resources before the window is destroyed.
 */

/**
 * Handles incoming Win32 messages for this window.
 *
 * @param window The handle to the window receiving the message.
 * @param message The Windows message identifier.
 * @param wparam Additional message information (word-sized).
 * @param lparam Additional message information (long-sized).
 * @returns The result of message processing as an LRESULT value.
 */
class FlutterWindow : public Win32Window {
 public:
  // Creates a new FlutterWindow hosting a Flutter view running |project|.
  explicit FlutterWindow(const flutter::DartProject& project);
  virtual ~FlutterWindow();

 protected:
  // Win32Window:
  bool OnCreate() override;
  void OnDestroy() override;
  LRESULT MessageHandler(HWND window, UINT const message, WPARAM const wparam,
                         LPARAM const lparam) noexcept override;

 private:
  // The project to run.
  flutter::DartProject project_;

  // The Flutter instance hosted by this window.
  std::unique_ptr<flutter::FlutterViewController> flutter_controller_;
};

#endif  // RUNNER_FLUTTER_WINDOW_H_
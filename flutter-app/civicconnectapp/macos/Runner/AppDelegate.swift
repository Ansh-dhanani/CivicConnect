import Cocoa
import FlutterMacOS

@main
class AppDelegate: FlutterAppDelegate {
  /// Indicates whether the application should quit when the last window closes.
  /// - Parameter sender: The application instance requesting the decision.
  /// - Returns: `true` to terminate the app when the last window is closed, `false` otherwise.
  override func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
    return true
  }

  /// Indicates whether the application supports secure state restoration.
  /// - Returns: `true` if the application supports secure state restoration, `false` otherwise.
  override func applicationSupportsSecureRestorableState(_ app: NSApplication) -> Bool {
    return true
  }
}
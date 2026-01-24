import Cocoa
import FlutterMacOS

class MainFlutterWindow: NSWindow {
  /// Prepares the window after nib loading by installing a Flutter view controller as the window's content, restoring the previous frame, registering generated plugins, and then deferring to the superclass.
  /// - Discussion: Creates a `FlutterViewController`, assigns it to `contentViewController`, reapplies the preserved `frame`, registers generated Flutter plugins with the view controller, and calls `super.awakeFromNib()`.
  override func awakeFromNib() {
    let flutterViewController = FlutterViewController()
    let windowFrame = self.frame
    self.contentViewController = flutterViewController
    self.setFrame(windowFrame, display: true)

    RegisterGeneratedPlugins(registry: flutterViewController)

    super.awakeFromNib()
  }
}
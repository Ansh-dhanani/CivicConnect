#include "my_application.h"

#include <flutter_linux/flutter_linux.h>
#ifdef GDK_WINDOWING_X11
#include <gdk/gdkx.h>
#endif

#include "flutter/generated_plugin_registrant.h"

struct _MyApplication {
  GtkApplication parent_instance;
  char** dart_entrypoint_arguments;
};

G_DEFINE_TYPE(MyApplication, my_application, GTK_TYPE_APPLICATION)

// Implements GApplication::activate.
/**
 * @brief Create and present the main application window and embed the Flutter view.
 *
 * Configures window chrome (header bar vs. traditional title bar) based on the
 * windowing environment, sets the window title and default size, constructs a
 * FlDartProject with the application's stored Dart entrypoint arguments, creates
 * and adds the FlView to the window, registers Flutter plugins, and gives the
 * Flutter view input focus.
 *
 * @param application The GApplication instance invoking activation.
 */
static void my_application_activate(GApplication* application) {
  MyApplication* self = MY_APPLICATION(application);
  GtkWindow* window =
      GTK_WINDOW(gtk_application_window_new(GTK_APPLICATION(application)));

  // Use a header bar when running in GNOME as this is the common style used
  // by applications and is the setup most users will be using (e.g. Ubuntu
  // desktop).
  // If running on X and not using GNOME then just use a traditional title bar
  // in case the window manager does more exotic layout, e.g. tiling.
  // If running on Wayland assume the header bar will work (may need changing
  // if future cases occur).
  gboolean use_header_bar = TRUE;
#ifdef GDK_WINDOWING_X11
  GdkScreen* screen = gtk_window_get_screen(window);
  if (GDK_IS_X11_SCREEN(screen)) {
    const gchar* wm_name = gdk_x11_screen_get_window_manager_name(screen);
    if (g_strcmp0(wm_name, "GNOME Shell") != 0) {
      use_header_bar = FALSE;
    }
  }
#endif
  if (use_header_bar) {
    GtkHeaderBar* header_bar = GTK_HEADER_BAR(gtk_header_bar_new());
    gtk_widget_show(GTK_WIDGET(header_bar));
    gtk_header_bar_set_title(header_bar, "civicconnectapp");
    gtk_header_bar_set_show_close_button(header_bar, TRUE);
    gtk_window_set_titlebar(window, GTK_WIDGET(header_bar));
  } else {
    gtk_window_set_title(window, "civicconnectapp");
  }

  gtk_window_set_default_size(window, 1280, 720);
  gtk_widget_show(GTK_WIDGET(window));

  g_autoptr(FlDartProject) project = fl_dart_project_new();
  fl_dart_project_set_dart_entrypoint_arguments(project, self->dart_entrypoint_arguments);

  FlView* view = fl_view_new(project);
  gtk_widget_show(GTK_WIDGET(view));
  gtk_container_add(GTK_CONTAINER(window), GTK_WIDGET(view));

  fl_register_plugins(FL_PLUGIN_REGISTRY(view));

  gtk_widget_grab_focus(GTK_WIDGET(view));
}

/**
 * @brief Implements the GApplication::local_command_line handler.
 *
 * Captures command-line arguments for the Dart entrypoint (excluding the binary
 * name), attempts to register the application, and activates the application.
 *
 * @param application The GApplication instance.
 * @param arguments Pointer to the argv array; the binary name is removed and the
 *                  remaining arguments are duplicated and stored in
 *                  MyApplication->dart_entrypoint_arguments (caller does not
 *                  retain ownership of the returned copy).
 * @param exit_status Set to `0` on successful registration and activation,
 *                    or `1` if application registration fails.
 * @return gboolean Always returns `TRUE` to indicate the local command line
 *         was handled.
 */
static gboolean my_application_local_command_line(GApplication* application, gchar*** arguments, int* exit_status) {
  MyApplication* self = MY_APPLICATION(application);
  // Strip out the first argument as it is the binary name.
  self->dart_entrypoint_arguments = g_strdupv(*arguments + 1);

  g_autoptr(GError) error = nullptr;
  if (!g_application_register(application, nullptr, &error)) {
     g_warning("Failed to register: %s", error->message);
     *exit_status = 1;
     return TRUE;
  }

  g_application_activate(application);
  *exit_status = 0;

  return TRUE;
}

/**
 * @brief Performs application startup initialization.
 *
 * Called when the GApplication is starting; implement application-specific
 * startup actions here. This implementation delegates to the parent class's
 * startup handler after performing any local initialization.
 *
 * @param application The GApplication instance being started.
 */
static void my_application_startup(GApplication* application) {
  //MyApplication* self = MY_APPLICATION(object);

  // Perform any actions required at application startup.

  G_APPLICATION_CLASS(my_application_parent_class)->startup(application);
}

/**
 * @brief Handle application shutdown and perform cleanup before exit.
 *
 * Performs any application-specific shutdown tasks and then invokes the parent
 * GApplication shutdown implementation.
 *
 * @param application The GApplication instance being shut down.
 */
static void my_application_shutdown(GApplication* application) {
  //MyApplication* self = MY_APPLICATION(object);

  // Perform any actions required at application shutdown.

  G_APPLICATION_CLASS(my_application_parent_class)->shutdown(application);
}

/**
 * @brief Releases resources held by a MyApplication instance before object finalization.
 *
 * Frees the stored Dart entrypoint argument vector and continues the GObject dispose chain.
 *
 * @param object The GObject to dispose; expected to be a MyApplication instance.
 */
static void my_application_dispose(GObject* object) {
  MyApplication* self = MY_APPLICATION(object);
  g_clear_pointer(&self->dart_entrypoint_arguments, g_strfreev);
  G_OBJECT_CLASS(my_application_parent_class)->dispose(object);
}

/**
 * @brief Initialize the MyApplicationClass by binding its lifecycle and dispose virtual methods.
 *
 * Assigns the class implementations for activate, local_command_line, startup, shutdown,
 * and dispose so instances of MyApplication use the application's custom behavior.
 *
 * @param klass The MyApplicationClass structure to initialize.
 */
static void my_application_class_init(MyApplicationClass* klass) {
  G_APPLICATION_CLASS(klass)->activate = my_application_activate;
  G_APPLICATION_CLASS(klass)->local_command_line = my_application_local_command_line;
  G_APPLICATION_CLASS(klass)->startup = my_application_startup;
  G_APPLICATION_CLASS(klass)->shutdown = my_application_shutdown;
  G_OBJECT_CLASS(klass)->dispose = my_application_dispose;
}

/**
 * @brief Initialize a MyApplication instance.
 *
 * Performs instance-specific initialization for MyApplication. Currently no
 * additional instance state is required.
 *
 * @param self The MyApplication instance being initialized.
 */
static void my_application_init(MyApplication* self) {}

/**
 * @brief Create a new MyApplication instance configured for this program.
 *
 * The created instance is initialized with the application ID (`APPLICATION_ID`)
 * and marked non-unique. The process program name is also set to
 * `APPLICATION_ID` to improve integration with desktop environments.
 *
 * @return MyApplication* A newly created `MyApplication` instance (owned by the
 * caller); the caller is responsible for unreferencing it when no longer needed.
 */
MyApplication* my_application_new() {
  // Set the program name to the application ID, which helps various systems
  // like GTK and desktop environments map this running application to its
  // corresponding .desktop file. This ensures better integration by allowing
  // the application to be recognized beyond its binary name.
  g_set_prgname(APPLICATION_ID);

  return MY_APPLICATION(g_object_new(my_application_get_type(),
                                     "application-id", APPLICATION_ID,
                                     "flags", G_APPLICATION_NON_UNIQUE,
                                     nullptr));
}
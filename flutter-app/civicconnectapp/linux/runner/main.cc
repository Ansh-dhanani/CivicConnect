#include "my_application.h"

/**
 * @brief Program entry point that creates a MyApplication instance and runs it.
 *
 * The function constructs a MyApplication using the application's factory and
 * hands control to GApplication's run loop, returning the application's exit code.
 *
 * @param argc Number of command-line arguments.
 * @param argv Array of command-line argument strings.
 * @return int Exit status returned by the application (0 on success, non-zero on error).
 */
int main(int argc, char** argv) {
  g_autoptr(MyApplication) app = my_application_new();
  return g_application_run(G_APPLICATION(app), argc, argv);
}
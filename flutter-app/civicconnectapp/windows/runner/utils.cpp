#include "utils.h"

#include <flutter_windows.h>
#include <io.h>
#include <stdio.h>
#include <windows.h>

#include <iostream>

/**
 * @brief Creates a new console for the process and redirects standard output and error to it.
 *
 * If a console is successfully allocated, this attaches stdout and stderr to the new console,
 * synchronizes C++ iostreams with the C stdio layer, and resynchronizes Flutter's output streams.
 * If console allocation fails, the function performs no action.
 */
void CreateAndAttachConsole() {
  if (::AllocConsole()) {
    FILE *unused;
    if (freopen_s(&unused, "CONOUT$", "w", stdout)) {
      _dup2(_fileno(stdout), 1);
    }
    if (freopen_s(&unused, "CONOUT$", "w", stderr)) {
      _dup2(_fileno(stdout), 2);
    }
    std::ios::sync_with_stdio();
    FlutterDesktopResyncOutputStreams();
  }
}

/**
 * @brief Converts the process command line from UTF-16 to UTF-8 and returns the arguments excluding the binary name.
 *
 * Converts the platform-wide wide-character command line into a vector of UTF-8 encoded strings suitable for the engine,
 * omitting the first argument (the program path). If retrieval of the command line fails, an empty vector is returned.
 *
 * @return std::vector<std::string> A vector of UTF-8 command line arguments, excluding the binary name; empty on failure.
 */
std::vector<std::string> GetCommandLineArguments() {
  // Convert the UTF-16 command line arguments to UTF-8 for the Engine to use.
  int argc;
  wchar_t** argv = ::CommandLineToArgvW(::GetCommandLineW(), &argc);
  if (argv == nullptr) {
    return std::vector<std::string>();
  }

  std::vector<std::string> command_line_arguments;

  // Skip the first argument as it's the binary name.
  for (int i = 1; i < argc; i++) {
    command_line_arguments.push_back(Utf8FromUtf16(argv[i]));
  }

  ::LocalFree(argv);

  return command_line_arguments;
}

/**
 * @brief Converts a null-terminated UTF-16 string to a UTF-8 encoded std::string.
 *
 * @param utf16_string Pointer to a null-terminated UTF-16 (wide) string. If null, no conversion is performed.
 * @return std::string The UTF-8 encoded representation of the input, excluding the trailing null character.
 *         Returns an empty string if the input is null or if the conversion fails.
 */
std::string Utf8FromUtf16(const wchar_t* utf16_string) {
  if (utf16_string == nullptr) {
    return std::string();
  }
  unsigned int target_length = ::WideCharToMultiByte(
      CP_UTF8, WC_ERR_INVALID_CHARS, utf16_string,
      -1, nullptr, 0, nullptr, nullptr)
    -1; // remove the trailing null character
  int input_length = (int)wcslen(utf16_string);
  std::string utf8_string;
  if (target_length == 0 || target_length > utf8_string.max_size()) {
    return utf8_string;
  }
  utf8_string.resize(target_length);
  int converted_length = ::WideCharToMultiByte(
      CP_UTF8, WC_ERR_INVALID_CHARS, utf16_string,
      input_length, utf8_string.data(), target_length, nullptr, nullptr);
  if (converted_length == 0) {
    return std::string();
  }
  return utf8_string;
}
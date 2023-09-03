#ifndef LOAD_STATIC_CONTENT_HPP
#define LOAD_STATIC_CONTENT_HPP

#include <iostream>
#include <chrono>
#include <thread>
#include <string>
#include <fstream>
#include <sstream>
#include <unordered_map>
#include <algorithm>
#include <vector>

#include <crow.h>

using namespace std;
using namespace crow;

/**
 * @description serves any static file using its name and file type
*/
void sendFile(response &res, std::string fileName, std::string contentType)
{
  auto ss = std::ostringstream{};
  std::ifstream file("/usr/src/cart_checkout/dist/" + fileName);
  std::cout << "Sending file: /usr/src/cart_checkout/dist/" << fileName << "\n\n\n";
  if (file)
  {
    ss << file.rdbuf();
    res.set_header("Content-Type", contentType);
    res.write(ss.str());
    std::string fileContents = ss.str();
  }
  else
  {
    char f[256];
    res.code = 404;
    res.write("FILE NOT FOUND!!\nEmail dy45@humboldt.edu for updates on the site (he might not know how to fix it though)\n\n\n)");
    res.write(getcwd(f, 256));
  }
  res.end();
}

void sendHTML(response &res, std::string fileName)
{
  sendFile(res, fileName, "text/html");
}

void sendJSON(response &res, std::string fileName)
{
  sendFile(res, fileName, "application/json");
}

void sendImage(response &res, std::string fileName)
{
  sendFile(res, "assets/" + fileName, "image/png");
}

void sendSVG(response &res, std::string fileName)
{
  sendFile(res, "assets/" + fileName, "image/svg+xml");
}

void sendScript(response &res, std::string fileName)
{
  sendFile(res, "assets/" + fileName, "text/javascript");
}

void sendStyle(response &res, std::string fileName)
{
  sendFile(res, "assets/" + fileName, "text/css");
}

bool to_bool(std::string s)
{
  return s == "false";
}

#endif
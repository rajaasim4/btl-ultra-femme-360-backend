const https = require("https");

const initializeInforuMobile = () => {
  const username = process.env.INFORU_USERNAME;
  const password = process.env.INFORU_PASSWORD;

  if (!username || !password) {
    throw new Error("InforUMobile credentials not configured");
  }

  // Create Basic Auth credentials
  const credentials = Buffer.from(`${username}:${password}`).toString("base64");

  return {
    hostname: "capi.inforu.co.il",
    path: "/api/v2/SMS/SendSms",
    authHeader: `Basic ${credentials}`,
    sender: process.env.INFORU_SENDER || "MyBrand",
  };
};

const sendSMS = (config, to, message) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      Data: {
        Message: message,
        Recipients: [
          {
            Phone: to,
          },
        ],
        Settings: {
          Sender: config.sender,
        },
      },
    });

    const options = {
      method: "POST",
      hostname: config.hostname,
      path: config.path,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: config.authHeader,
        "Content-Length": Buffer.byteLength(postData),
      },
      timeout: 30000, // 30 second timeout
    };

    const req = https.request(options, (res) => {
      let chunks = [];

      res.on("data", (chunk) => {
        chunks.push(chunk);
      });

      res.on("end", () => {
        const body = Buffer.concat(chunks).toString();

        try {
          const response = JSON.parse(body);

          if (res.statusCode === 200) {
            console.log("InforUMobile Response:", response);
            resolve(response);
          } else {
            console.error("InforUMobile Error Response:", response);
            reject(
              new Error(`SMS failed with status ${res.statusCode}: ${body}`)
            );
          }
        } catch (parseError) {
          console.error("Failed to parse response:", body);
          reject(new Error(`Invalid response from InforUMobile: ${body}`));
        }
      });
    });

    req.on("error", (error) => {
      console.error("InforUMobile Request Error:", error);

      if (error.code === "ETIMEDOUT" || error.code === "ESOCKETTIMEDOUT") {
        reject(
          new Error("Connection timeout - please check your network connection")
        );
      } else if (error.code === "ENOTFOUND") {
        reject(
          new Error("Cannot reach InforUMobile server - DNS lookup failed")
        );
      } else if (error.code === "ECONNREFUSED") {
        reject(new Error("Connection refused by InforUMobile server"));
      } else {
        reject(new Error(`Network error: ${error.message}`));
      }
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout - InforUMobile server not responding"));
    });

    req.write(postData);
    req.end();
  });
};

module.exports = {
  initializeInforuMobile,
  sendSMS,
};

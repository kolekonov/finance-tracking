import axios from "axios";
import fs from "fs";
console.log(process.cwd(), 23);
const options = {
  method: "get",
  url: "https://cloud-api.yandex.net/v1/disk/resources/upload",
  headers: {
    Authorization:
      "OAuth y0_AgAAAAA25mIjAAsR3gAAAAD2qBp4RU0aNtGWR-646rYgdvViNGFIGC0",
  },
  params: {
    path: "/apps/finance-tracking/finance-tracking.db-" + new Date().toDateString(),
  },
};

axios(options)
  .then((response) => {
    console.log(response.data.href);
    const fileContent = fs.readFileSync(process.cwd() + "/prisma/finance-tracking.db");

    const url = response.data.href;

    axios
      .put(url, fileContent, {
        headers: {
          "Content-Type": "application/octet-stream",
        },
      })
      .then((response) => {
        console.log("Успешно отправлено:", response.data);
      })
      .catch((error) => {
        console.error("Ошибка при отправке файла:", error);
      });
  })
  .catch((error) => {
    console.error(error);
  });

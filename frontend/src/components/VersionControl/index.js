import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Button from "@material-ui/core/Button";

const packageVersion = require("../../../package.json").version;

const VersionControl = () => {
  const [storedVersion] = useState(window.localStorage.getItem("version") || "2.0.0");

  const handleUpdateVersion = async () => {
    window.localStorage.setItem("version", packageVersion);
    const { data } = await api.post("/version", {
      version: packageVersion,
    });
    caches.keys().then(function (names) {
      for (let name of names) caches.delete(name);
    });
    setTimeout(() => {
      window.location.reload(true);
    }, 1000);
  };

  return (
    <div>
     { /* Implementar a função de troca de versão aqui. */}
    </div>
  );
};

export default VersionControl;

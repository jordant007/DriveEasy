import React from "react";
import { ClipLoader } from "react-spinners";
import styles from "./Loader.module.css";

const Loader = ({ size = 50, color = "#123abc", loading = true }) => {
  return (
    <div className={styles.loaderContainer}>
      {loading && <ClipLoader color={color} size={size} />}
    </div>
  );
};

export default Loader;
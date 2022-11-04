import React from "react";
import { Route, Routes } from "react-router-dom";
import { OAuth2RedirectHandler } from "./components/welcome/OAuth2RedirectHandler";
import ApiDocs from "./pages/ApiDocs";
import CreateApi from "./pages/CreateApi/CreateApi";
import Main from "./pages/Main";
import TestApi from "./pages/TestApi";
import Welcome from "./pages/Welcome";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/main" element={<Main />} />
        <Route path="/oauth2/redirect/" element={<OAuth2RedirectHandler />}></Route>
        <Route path="/" element={<Main />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/createApi" element={<CreateApi />} />
        <Route path="/apiDocs" element={<ApiDocs />} />
        <Route path="/testApi" element={<TestApi />} />
        {/* <Route path="/" element={<TestApi />} /> 작업할 때 사용하는 공간입니다. */}
      </Routes>
    </div>
  );
};

export default App;

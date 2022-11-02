import React, { useState } from "react";
import { ApisType, ControllerType } from "./ApisType";
import "./CreateApi.scss";
import Sidebar from "../../components/CreateApi/Sidebar/Sidebar";
import Table from "../../components/CreateApi/Table/Table";
import { useSyncedStore } from "@syncedstore/react";
import { store } from "../../components/CreateApi/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const CreateApi = () => {
  // api 정보를 저장할 state
  const [apiData, setApiData] = useState<ApisType>({
    name: "",
    uri: "",
    method: "GET",
    requestBody: {
      dtoName: "",
      name: "",
      type: "",
      collectionType: "",
      properties: [
        {
          name: "",
          type: "",
          required: true,
          properties: [],
          collectionType: "",
        },
      ],
      required: true,
    },
    parameters: [
      {
        name: "",
        type: "",
        required: true,
        properties: [],
        collectionType: "",
      },
    ],
    query: {
      dtoName: "",
      name: "",
      type: "",
      collectionType: "",
      properties: [
        {
          name: "",
          type: "",
          required: true,
          properties: [],
          collectionType: "",
        },
      ],
      required: true,
    },
    headers: [{ key: "", value: "" }],
    responses: {
      fail: {
        status: 400,
        type: "",
        required: true,
        properties: [
          {
            name: "",
            type: "",
            required: true,
            properties: [],
            collectionType: "",
          },
        ],
      },
      success: {
        status: 200,
        type: "",
        required: true,
        properties: [
          {
            name: "",
            type: "",
            required: true,
            properties: [],
            collectionType: "",
          },
        ],
      },
    },
  });
  // controller 정보를 저장할 state
  const [controllerData, setControllerData] = useState<ControllerType>({
    name: "",
    commonUri: "",
    apis: [],
  });

  const state = useSyncedStore(store);
  // 테이블의 탭 전환을 위한 state
  const [activeTab, setActiveTab] = useState(1);
  // 선택된 api를 저장할 state
  const [selectedApi, setSelectedApi] = useState(-1);
  const [selectedController, setSelectedController] = useState(-1);

  // controller 추가 함수 -> 기존 데이터에 새 데이터 추가
  const addController = () => {
    state.data.push(controllerData);
  };

  // api 추가 함수 -> 기존 데이터에 새 데이터 추가
  const addApi = (index: number) => {
    state.data[index].apis.push(apiData);
  };

  // table의 row 추가 함수
  const addTableRow = (responseType?: "fail" | "success") => {
    if (activeTab === 1) {
      state.data[selectedController].apis[selectedApi].headers.push({
        key: "",
        value: "",
      });
    } else if (activeTab === 2) {
      state.data[selectedController].apis[selectedApi].parameters.push({
        name: "",
        type: "",
        required: true,
        properties: [],
        collectionType: "",
      });
    } else if (activeTab === 3 || activeTab === 4) {
      const tab = activeTab === 3 ? "query" : "requestBody";
      state.data[selectedController].apis[selectedApi][tab].properties.push({
        name: "",
        type: "",
        required: true,
        properties: [],
        collectionType: "",
      });
    } else if (activeTab === 5 && responseType) {
      state.data[selectedController].apis[selectedApi].responses[
        responseType
      ].properties.push({
        name: "",
        type: "",
        required: true,
        properties: [],
        collectionType: "",
      });
    }
  };

  // 사이드바의 api 정보 가져오는 함수
  const handleSidebarApi = (index: number, idx: number) => {
    setSelectedController(index);
    setSelectedApi(idx);
    setActiveTab(1);
  };
  // 데이터 확인 용 로그
  console.log(JSON.parse(JSON.stringify(state.data)));

  return (
    <div className="apiDocscontainer">
      <Sidebar
        addController={addController}
        addApi={addApi}
        state={state}
        handleSidebarApi={handleSidebarApi}
      />
      <div className="apiDocsMaincontainer">
        <div className="titleContainer">
          <p className="apiDocsTitleText">APICloud API 명세서</p>
          <div className="buttonContainer">
            <button>공유</button>
            <button>동기화</button>
            <button>추출</button>
          </div>
        </div>
        <div className="infoContainer">
          <div>
            <p>사이트 주소</p>
            <p className="infoValue">http://localhost:8080</p>
          </div>
          <div>
            <p>공통 URI</p>
            <p className="infoValue">/api</p>
          </div>
        </div>
        <div className="tabContainer">
          <div
            className={activeTab === 1 ? "tabItem active" : "tabItem"}
            onClick={() => setActiveTab(1)}
          >
            headers
          </div>
          <div
            className={activeTab === 2 ? "tabItem active" : "tabItem"}
            onClick={() => setActiveTab(2)}
          >
            parameters
          </div>
          <div
            className={activeTab === 3 ? "tabItem active" : "tabItem"}
            onClick={() => setActiveTab(3)}
          >
            query
          </div>
          <div
            className={activeTab === 4 ? "tabItem active" : "tabItem"}
            onClick={() => setActiveTab(4)}
          >
            requestBody
          </div>
          <div
            className={activeTab === 5 ? "tabItem active" : "tabItem"}
            onClick={() => setActiveTab(5)}
          >
            responses
          </div>
        </div>
        <div className="tableContainer">
          {selectedApi > -1 && selectedController > -1 && (
            <div className="apiTable">
              <button
                className="apiPlusButton"
                onClick={() => addTableRow("success")}
              >
                <FontAwesomeIcon icon={faPlus} className="plusIcon" />
              </button>
              <Table
                activeTab={activeTab}
                selectedController={selectedController}
                selectedApi={selectedApi}
                data={
                  activeTab === 1
                    ? JSON.parse(
                        JSON.stringify(
                          state.data[selectedController].apis[selectedApi]
                            .headers
                        )
                      )
                    : activeTab === 2
                    ? JSON.parse(
                        JSON.stringify(
                          state.data[selectedController].apis[selectedApi]
                            .parameters
                        )
                      )
                    : activeTab === 3
                    ? JSON.parse(
                        JSON.stringify(
                          state.data[selectedController].apis[selectedApi].query
                            .properties
                        )
                      )
                    : activeTab === 4
                    ? JSON.parse(
                        JSON.stringify(
                          state.data[selectedController].apis[selectedApi]
                            .requestBody.properties
                        )
                      )
                    : JSON.parse(
                        JSON.stringify(
                          state.data[selectedController].apis[selectedApi]
                            .responses.success.properties
                        )
                      )
                }
                state={state}
                responseType={"success"}
              />
            </div>
          )}
          {selectedApi > -1 && selectedController > -1 && activeTab === 5 && (
            <div className="apiTable">
              <button
                className="apiPlusButton"
                onClick={() => addTableRow("fail")}
              >
                <FontAwesomeIcon icon={faPlus} className="plusIcon" />
              </button>
              <Table
                activeTab={activeTab}
                selectedController={selectedController}
                selectedApi={selectedApi}
                data={JSON.parse(
                  JSON.stringify(
                    state.data[selectedController].apis[selectedApi].responses
                      .fail.properties
                  )
                )}
                state={state}
                responseType={"fail"}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateApi;

import { MappedTypeDescription } from "@syncedstore/core/types/doc";
import React, { useState } from "react";
import { ControllerType } from "../../../pages/CreateApi/ApisType";
import SelectTypes from "../SelectTypes/SelectTypes";
import "./Table.scss";

interface Props {
  activeTab: number;
  handleBasicInfo: (
    e: React.ChangeEvent<HTMLInputElement> | string,
    type: string,
    depth: number,
    responseType?: string
  ) => void;
  selectedController: number;
  selectedApi: number;
  state: MappedTypeDescription<{
    data: ControllerType[];
  }>;
  responseType?: string;
}

const TableInfo = ({
  activeTab,
  handleBasicInfo,
  selectedApi,
  selectedController,
  state,
  responseType,
}: Props) => {
  const info = activeTab === 3 ? "query" : "requestBody";
  return (
    <div>
      {activeTab === 3 || activeTab === 4 ? (
        <div className="tableInfoGroup">
          {state.data[selectedController].apis[selectedApi][info].type ===
            "Object" && (
            <div className="tableInfoInputGroup">
              <label htmlFor={`dtoName${activeTab}`} className="tableInfoLabel">
                dtoName
              </label>
              <input
                className="tableInfoInput"
                type="text"
                id={`dtoName${activeTab}`}
                onChange={(e) => handleBasicInfo(e, "dtoName", 0)}
                value={
                  activeTab === 3
                    ? state.data[selectedController].apis[selectedApi].query
                        .dtoName
                    : state.data[selectedController].apis[selectedApi]
                        .requestBody.dtoName
                }
              />
            </div>
          )}
          <div className="tableInfoInputGroup">
            <label htmlFor={`name${activeTab}`} className="tableInfoLabel">
              name
            </label>
            <input
              className="tableInfoInput"
              type="text"
              id={`name${activeTab}`}
              onChange={(e) => handleBasicInfo(e, "name", 0)}
              value={
                activeTab === 3
                  ? state.data[selectedController].apis[selectedApi].query.name
                  : state.data[selectedController].apis[selectedApi].requestBody
                      .name
              }
            />
          </div>
          <div className="typeInputContainer">
            <p className="typeInputLabel">type</p>
            <SelectTypes handleBasicInfo={handleBasicInfo} depth={1} />
          </div>
          <div className="tableInfoInputGroup">
            <label htmlFor={`required${activeTab}`} className="tableInfoLabel">
              required
            </label>
            <input
              className="tableInfoInput"
              type="checkbox"
              id={`required${activeTab}`}
              onChange={(e) => handleBasicInfo(e, "required", 0)}
              checked={
                activeTab === 3 && state.data
                  ? state.data[selectedController].apis[selectedApi].query
                      .required
                    ? true
                    : false
                  : state.data[selectedController].apis[selectedApi].requestBody
                      .required
                  ? true
                  : false
              }
            />
          </div>
        </div>
      ) : activeTab === 5 &&
        (responseType === "fail" || responseType === "success") ? (
        <>
          <div className="responseTypeGroup">
            <p className="responseTypeLabel">{responseType}</p>
            <label htmlFor="successStatus" className="tableInfoLabel">
              status
            </label>
            <input
              className="tableInfoInput"
              type="number"
              id="successStatus"
              onChange={(e) => handleBasicInfo(e, "status", 0, responseType)}
              value={
                state.data[selectedController].apis[selectedApi].responses[
                  responseType
                ].status
              }
            />
          </div>
          <div className="tableInfoGroup">
            {state.data[selectedController].apis[selectedApi].responses[
              responseType
            ].responseBody.type === "Object" && (
              <div className="tableInfoInputGroup">
                <label htmlFor="successDtoName" className="tableInfoLabel">
                  dtoName
                </label>
                <input
                  className="tableInfoInput"
                  type="text"
                  id="successDtoName"
                  onChange={(e) =>
                    handleBasicInfo(e, "dtoName", 0, responseType)
                  }
                  value={
                    state.data[selectedController].apis[selectedApi].responses[
                      responseType
                    ].responseBody.dtoName
                  }
                />
              </div>
            )}
            <div className="tableInfoInputGroup">
              <label htmlFor="successName" className="tableInfoLabel">
                name
              </label>
              <input
                className="tableInfoInput"
                type="text"
                id="successName"
                onChange={(e) => handleBasicInfo(e, "name", 0, responseType)}
                value={
                  state.data[selectedController].apis[selectedApi].responses[
                    responseType
                  ].responseBody.name
                }
              />
            </div>
            <div className="typeInputContainer">
              <p className="typeInputLabel">type</p>
              <SelectTypes
                handleBasicInfo={handleBasicInfo}
                responseType={responseType}
                depth={1}
              />
            </div>
            <div className="tableInfoInputGroup">
              <label htmlFor="successRequired" className="tableInfoLabel">
                required
              </label>
              <input
                type="checkbox"
                id="successRequired"
                onChange={(e) =>
                  handleBasicInfo(e, "required", 0, responseType)
                }
                checked={
                  state.data[selectedController].apis[selectedApi].responses[
                    responseType
                  ].responseBody.required
                    ? true
                    : false
                }
              />
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default TableInfo;
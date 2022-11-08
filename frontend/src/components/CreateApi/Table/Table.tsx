import React, { useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
  RowData,
  ColumnResizeMode,
} from "@tanstack/react-table";
import "./Table.scss";
import {
  ControllerType,
  HeadersType,
  PropertiesType,
} from "../../../pages/CreateApi/ApisType";
import TableInfo from "./TableInfo";
import { MappedTypeDescription } from "@syncedstore/core/types/doc";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfo, faRemove } from "@fortawesome/free-solid-svg-icons";
import SelectTypes from "../SelectTypes/SelectTypes";
import DtoInputModal from "../DtoInputModal/DtoInputModal";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

// createApi에서 받아오는 props의 type 설정
interface Props {
  activeTab: number;
  selectedController: number;
  selectedApi: number;
  data: PropertiesType[] | HeadersType[];
  state: MappedTypeDescription<{
    data: ControllerType[];
  }>;
  responseType?: string;
  setPropertiesIndexList: React.Dispatch<React.SetStateAction<number[]>>;
  propertiesIndexList: number[];
  setDepth: React.Dispatch<React.SetStateAction<number>>;
  depth: number;
}

const Table = ({
  activeTab,
  selectedController,
  selectedApi,
  data,
  state,
  responseType,
  setPropertiesIndexList,
  propertiesIndexList,
  setDepth,
  depth,
}: Props) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [propertiesIndex, setPropertiesIndex] = useState(-1);
  const [modalPath, setModalPath] = useState<PropertiesType>();

  const getDepth: (idx: number, datas?: any) => number = (
    idx: number,
    datas?: any
  ) => {
    let path =
      activeTab === 2
        ? state.data[selectedController].apis[selectedApi].parameters
        : activeTab === 3
        ? state.data[selectedController].apis[selectedApi].queries
        : activeTab === 4
        ? state.data[selectedController].apis[selectedApi].requestBody
            .properties
        : activeTab === 5 &&
          (responseType === "fail" || responseType === "success")
        ? state.data[selectedController].apis[selectedApi].responses[
            responseType
          ].responseBody.properties
        : state.data[selectedController].apis[selectedApi].parameters;

    let i = 2;
    let depth = 2;
    while (path?.length > 0 && i < 11) {
      if (typeof datas !== undefined && data.length > idx) {
        const isDepth = path.find((item: any) => {
          return (
            item.dtoName === datas[idx]?.dtoName &&
            item.name === datas[idx].name
          );
        });
        if (!!isDepth) {
          depth = i;
          break;
        }
      }
      if (propertiesIndexList[i - 2] > -1) {
        path = path[propertiesIndexList[i - 2]]?.properties;
      }
      i++;
      console.log(i, depth, JSON.parse(JSON.stringify(path)));
    }
    console.log(JSON.parse(JSON.stringify(path)));
    return depth;
  };

  const addProperties = (index: number, flag?: boolean, depth1?: number) => {
    let path =
      activeTab === 2
        ? state.data[selectedController].apis[selectedApi].parameters
        : activeTab === 3
        ? state.data[selectedController].apis[selectedApi].queries
        : activeTab === 4
        ? state.data[selectedController].apis[selectedApi].requestBody
            .properties
        : activeTab === 5 &&
          (responseType === "fail" || responseType === "success")
        ? state.data[selectedController].apis[selectedApi].responses[
            responseType
          ].responseBody.properties
        : state.data[selectedController].apis[selectedApi].parameters;

    const newData = {
      dtoName: "",
      name: "",
      type: "String",
      collectionType: "",
      properties: [],
      required: true,
    };
    if (depth1 && (depth1 > 3 || depth1 === 3)) {
      for (let i = 0; i < depth1 - 1; i++) {
        if (propertiesIndexList[i] > -1) {
          path = path[propertiesIndexList[i]].properties;
        }
      }
      console.log("next for path", JSON.parse(JSON.stringify(path)));

      if (path[index]?.properties.length === 0 || flag) {
        console.log("over three path", JSON.parse(JSON.stringify(path)));
        path[index].properties.push(newData);
      }
    } else {
      if (path[index]?.properties.length === 0 || flag) {
        console.log("under three path", JSON.parse(JSON.stringify(path)));
        path[index].properties.push(newData);
      }
    }
  };

  const deleteRow = (index: number, depth: number, propIndex?: number) => {
    if (activeTab === 1) {
      state.data[selectedController].apis[selectedApi].headers.splice(index, 1);
    } else if (activeTab === 2 || activeTab === 3) {
      const tab = activeTab === 3 ? "queries" : "parameters";
      let rootPath =
        depth === 2 && propIndex
          ? state.data[selectedController].apis[selectedApi][tab][propIndex]
              .properties
          : state.data[selectedController].apis[selectedApi][tab];
      rootPath.splice(index, 1);
    } else if (activeTab === 4) {
      let rootPath =
        depth === 2 && propIndex
          ? state.data[selectedController].apis[selectedApi].requestBody
              .properties[propIndex].properties
          : state.data[selectedController].apis[selectedApi].requestBody
              .properties;

      rootPath.splice(index, 1);
    } else if (
      activeTab === 5 &&
      (responseType === "fail" || responseType === "success")
    ) {
      let rootPath =
        depth === 2 && propIndex
          ? state.data[selectedController].apis[selectedApi].responses[
              responseType
            ].responseBody.properties[propIndex].properties
          : state.data[selectedController].apis[selectedApi].responses[
              responseType
            ].responseBody.properties;
      rootPath.splice(index, 1);
    }
  };

  const defaultColumn: Partial<ColumnDef<PropertiesType | HeadersType>> = {
    cell: function Cell({ getValue, row: { index }, column: { id }, table }) {
      const initialValue = getValue<string>();
      const [value, setValue] = useState<string>(initialValue);
      const rootPath = state.data[selectedController].apis[selectedApi];

      const onBlur = (temp?: string) => {
        table.options.meta?.updateData(index, id, temp ? temp : value);
        if (temp) {
          setValue(id === "type" && temp === "List" ? "String" : temp);
        }
      };

      useEffect(() => {
        setValue(initialValue);
      }, [initialValue]);

      return id === "required" ? (
        <input
          value={value as string}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => onBlur()}
          className="tableInput"
          type="checkbox"
        />
      ) : id === "delete" ? (
        <FontAwesomeIcon
          icon={faRemove}
          className="removeIcon"
          onClick={() => deleteRow(index, 1)}
        />
      ) : id === "type" ? (
        <div className="typeInfoContainer">
          {activeTab === 2 &&
          rootPath.parameters[index].collectionType === "List" ? (
            <SelectTypes
              onBlur={onBlur}
              setValue={setValue}
              value={"List"}
              isCollection={true}
            />
          ) : activeTab === 3 &&
            rootPath.queries[index].collectionType === "List" ? (
            <SelectTypes
              onBlur={onBlur}
              setValue={setValue}
              value={"List"}
              isCollection={true}
            />
          ) : activeTab === 4 &&
            rootPath.requestBody.properties[index].collectionType === "List" ? (
            <SelectTypes
              onBlur={onBlur}
              setValue={setValue}
              value={"List"}
              isCollection={true}
            />
          ) : activeTab === 5 &&
            (responseType === "fail" || responseType === "success") &&
            rootPath.responses[responseType].responseBody.properties[index]
              .collectionType === "List" ? (
            <SelectTypes
              onBlur={onBlur}
              setValue={setValue}
              value={"List"}
              isCollection={true}
            />
          ) : (
            <></>
          )}
          <SelectTypes onBlur={onBlur} setValue={setValue} value={value} />
          {value === "Object" && (
            <FontAwesomeIcon
              icon={faInfo}
              className="infoIcon"
              onClick={() => {
                setDepth(2);
                setPropertiesIndexList((old) => {
                  let copy = [...old];
                  copy[getDepth(index, data[index]) - 2] = index;
                  return copy;
                });
                addProperties(index, false, getDepth(index, data[index]));
                setPropertiesIndex(index);
                setIsModalVisible(!isModalVisible);
              }}
            />
          )}
        </div>
      ) : (
        <input
          value={value as string}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => onBlur()}
          className="tableInput"
        />
      );
    },
  };

  const columns = useMemo<ColumnDef<PropertiesType | HeadersType>[]>(
    () =>
      activeTab === 1
        ? [
            {
              accessorKey: "key",
              footer: (props) => props.column.id,
            },
            {
              accessorKey: "value",
              footer: (props) => props.column.id,
            },
            {
              accessorKey: "delete",
              footer: (props) => props.column.id,
              size: 50,
            },
          ]
        : activeTab === 2 || activeTab === 3 || activeTab === 4
        ? [
            {
              accessorKey: "name",
              footer: (props) => props.column.id,
            },
            {
              accessorKey: "type",
              footer: (props) => props.column.id,
            },
            {
              accessorKey: "required",
              footer: (props) => props.column.id,
            },
            {
              accessorKey: "delete",
              footer: (props) => props.column.id,
              size: 50,
            },
          ]
        : [
            {
              header: responseType ? responseType : "",
              footer: (props) => props.column.id,
              columns: [
                {
                  accessorKey: "name",
                  footer: (props) => props.column.id,
                },
                {
                  accessorKey: "type",
                  footer: (props) => props.column.id,
                },
                {
                  accessorKey: "required",
                  footer: (props) => props.column.id,
                },
                {
                  accessorKey: "delete",
                  footer: (props) => props.column.id,
                  size: 50,
                },
              ],
            },
          ],
    [activeTab]
  );

  const [columnResizeMode, setColumnResizeMode] =
    useState<ColumnResizeMode>("onChange");

  useEffect(() => {
    setPropertiesIndexList([-1, -1, -1, -1, -1, -1, -1, -1, -1]);
    setDepth(2);
  }, [activeTab]);

  const table = useReactTable({
    data,
    columns,
    columnResizeMode,
    defaultColumn,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex: string | number, columnId: any, value: any) => {
        if (!!value && state.data) {
          const newValue = value === "true" ? false : true;
          const type =
            columnId === "name"
              ? "name"
              : columnId === "type"
              ? "type"
              : "required";
          if (activeTab === 1) {
            state.data[selectedController].apis[selectedApi].headers.map(
              (row, idx) => {
                if (idx === rowIndex && state.data) {
                  const type = columnId === "key" ? "key" : "value";
                  state.data[selectedController].apis[selectedApi].headers[
                    rowIndex
                  ][type] = value;
                }
              }
            );
          } else if (activeTab === 2 || activeTab === 3) {
            const tab = activeTab === 3 ? "queries" : "parameters";
            state.data[selectedController].apis[selectedApi][tab].map(
              (row, idx) => {
                if (idx === rowIndex && state.data) {
                  if (type === "required") {
                    state.data[selectedController].apis[selectedApi][tab][
                      rowIndex
                    ][type] = newValue;
                  } else {
                    if (type === "type" && value === "List") {
                      state.data[selectedController].apis[selectedApi][tab][
                        rowIndex
                      ].collectionType = value;
                      state.data[selectedController].apis[selectedApi][tab][
                        rowIndex
                      ][type] = "String";
                    } else if (type === "type" && value === "X") {
                      state.data[selectedController].apis[selectedApi][tab][
                        rowIndex
                      ].collectionType = "";
                    } else {
                      state.data[selectedController].apis[selectedApi][tab][
                        rowIndex
                      ][type] = value;
                    }
                  }
                }
              }
            );
          } else if (activeTab === 4) {
            state.data[selectedController].apis[
              selectedApi
            ].requestBody.properties.map((row, idx) => {
              if (idx === rowIndex && state.data) {
                if (type === "required") {
                  state.data[selectedController].apis[
                    selectedApi
                  ].requestBody.properties[rowIndex][type] = newValue;
                } else {
                  if (type === "type" && value === "List") {
                    state.data[selectedController].apis[
                      selectedApi
                    ].requestBody.properties[rowIndex].collectionType = value;
                    state.data[selectedController].apis[
                      selectedApi
                    ].requestBody.properties[rowIndex][type] = "String";
                  } else if (type === "type" && value === "X") {
                    state.data[selectedController].apis[
                      selectedApi
                    ].requestBody.properties[rowIndex].collectionType = "";
                  } else {
                    state.data[selectedController].apis[
                      selectedApi
                    ].requestBody.properties[rowIndex][type] = value;
                  }
                }
              }
            });
          } else if (
            activeTab === 5 &&
            (responseType === "fail" || responseType === "success")
          ) {
            state.data[selectedController].apis[selectedApi].responses[
              responseType
            ].responseBody.properties.map((row, idx) => {
              if (idx === rowIndex && state.data) {
                if (type === "required") {
                  state.data[selectedController].apis[selectedApi].responses[
                    responseType
                  ].responseBody.properties[rowIndex][type] = newValue;
                } else {
                  if (type === "type" && value === "List") {
                    state.data[selectedController].apis[selectedApi].responses[
                      responseType
                    ].responseBody.properties[rowIndex].collectionType = value;
                    state.data[selectedController].apis[selectedApi].responses[
                      responseType
                    ].responseBody.properties[rowIndex][type] = "String";
                  } else if (type === "type" && value === "X") {
                    state.data[selectedController].apis[selectedApi].responses[
                      responseType
                    ].responseBody.properties[rowIndex].collectionType = "";
                  } else {
                    state.data[selectedController].apis[selectedApi].responses[
                      responseType
                    ].responseBody.properties[rowIndex][type] = value;
                  }
                }
              }
            });
          }
        }
      },
    },
    debugTable: true,
  });

  const handleBasicInfo = (
    e: React.ChangeEvent<HTMLInputElement> | string,
    type: string,
    depth: number,
    responseType?: string
  ) => {
    const key =
      type === "name"
        ? "name"
        : type === "type"
        ? "type"
        : type === "dtoName"
        ? "dtoName"
        : "required";
    const rootPath = state.data[selectedController].apis[selectedApi];
    let path =
      activeTab === 2
        ? rootPath.parameters[propertiesIndexList[0]]
        : activeTab === 3
        ? rootPath.queries[propertiesIndexList[0]]
        : activeTab === 4
        ? rootPath.requestBody
        : activeTab === 5 &&
          (responseType === "fail" || responseType === "success")
        ? rootPath.responses[responseType].responseBody
        : rootPath.parameters[propertiesIndexList[0]];
    for (let i = 0; i < depth - 2; i++) {
      if (propertiesIndexList[i] !== -1) {
        path = path.properties[propertiesIndexList[i]];
      }
      console.log(i);
    }
    console.log(JSON.parse(JSON.stringify(path)));

    if (
      (activeTab === 2 || activeTab === 3) &&
      typeof e !== "string" &&
      key === "dtoName"
    ) {
      console.log(JSON.parse(JSON.stringify(path)), e.target.value);

      path[key] = e.target.value;
    }
    if (activeTab === 4 && state.data) {
      if (typeof e !== "string" && key === "required") {
        path[key] = e.target.checked;
      } else if (
        typeof e !== "string" &&
        (key === "name" || key === "dtoName")
      ) {
        path[key] = e.target.value;
      } else if (typeof e === "string" && key === "type") {
        if (e === "List") {
          path.collectionType = "List";
          path[key] = "String";
        } else if (e === "X") {
          path.collectionType = "";
        } else {
          path[key] = e;
        }
      }
    } else if (activeTab === 5 && state.data) {
      const key2 =
        type === "name"
          ? "name"
          : type === "type"
          ? "type"
          : type === "dtoName"
          ? "dtoName"
          : type === "status"
          ? "status"
          : "required";
      if (typeof e !== "string" && key2 === "required") {
        path[key2] = e.target.checked;
      } else if (
        typeof e !== "string" &&
        (key2 === "name" || key2 === "dtoName")
      ) {
        path[key2] = e.target.value;
      } else if (
        typeof e !== "string" &&
        key2 === "status" &&
        (responseType === "fail" || responseType === "success")
      ) {
        state.data[selectedController].apis[selectedApi].responses[
          responseType
        ][key2] = Number(e.target.value);
      } else if (typeof e === "string" && key2 === "type") {
        if (e === "List") {
          path.collectionType = "List";
          path[key2] = "String";
        } else if (e === "X") {
          path.collectionType = "X";
        } else {
          path[key2] = e;
        }
      }
    }
  };

  return (
    <div>
      {isModalVisible && (
        <DtoInputModal
          setIsModalVisible={setIsModalVisible}
          activeTab={activeTab}
          state={state}
          selectedController={selectedController}
          selectedApi={selectedApi}
          propertiesIndex={propertiesIndex}
          responseType={responseType}
          handleBasicInfo={handleBasicInfo}
          addProperties={addProperties}
          deleteRow={deleteRow}
          setPropertiesIndexList={setPropertiesIndexList}
          propertiesIndexList={propertiesIndexList}
          setDepth={setDepth}
          depth={depth}
          setPropertiesIndex={setPropertiesIndex}
          modalPath={modalPath}
          getDepth={getDepth}
        />
      )}
      <TableInfo
        activeTab={activeTab}
        handleBasicInfo={handleBasicInfo}
        selectedApi={selectedApi}
        selectedController={selectedController}
        state={state}
        responseType={responseType}
      />
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    {...{
                      key: header.id,
                      colSpan: header.colSpan,
                      style: {
                        width: header.getSize(),
                      },
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    <div
                      {...{
                        onMouseDown: header.getResizeHandler(),
                        onTouchStart: header.getResizeHandler(),
                        className: `resizer ${
                          header.column.getIsResizing() ? "isResizing" : ""
                        }`,
                        style: {
                          transform:
                            columnResizeMode === "onEnd" &&
                            header.column.getIsResizing()
                              ? `translateX(${
                                  table.getState().columnSizingInfo.deltaOffset
                                }px)`
                              : "",
                        },
                      }}
                    />
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

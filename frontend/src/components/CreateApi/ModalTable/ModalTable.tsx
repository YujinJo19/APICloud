import { ColumnDef, useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import React, { useEffect, useMemo, useState } from "react";
import { ApisType, ControllerType } from "../../../pages/CreateApi/ApisType";
import SelectMethods from "../SelectMethods/SelectMethods";
import "../ControllerAddModal/ControllerAddModal.scss";
import { MappedTypeDescription } from "@syncedstore/core/types/doc";
import { faRemove } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// ControllerAddModal에서 받아오는 props의 type 설정
interface Props {
  data: ApisType[];
  state: MappedTypeDescription<{
    data: ControllerType[];
  }>;
  editControllerIndex: number;
  addedControllerIndex: number;
}
const ModalTable = ({
  data,
  state,
  editControllerIndex,
  addedControllerIndex,
}: Props) => {
  const defaultColumn: Partial<ColumnDef<ApisType>> = {
    cell: function Cell({ getValue, row: { index }, column: { id }, table }) {
      const initialValue = getValue<string>();
      const [value, setValue] = useState<string>(initialValue);

      const onBlur = (temp?: string) => {
        table.options.meta?.updateData(index, id, temp ? temp : value);
      };

      const deleteApi = () => {
        state.data[
          editControllerIndex > -1 ? editControllerIndex : addedControllerIndex
        ].apis.splice(index, 1);
      };

      useEffect(() => {
        setValue(initialValue);
      }, [initialValue]);

      return id === "method" ? (
        <SelectMethods onBlur={onBlur} setValue={setValue} value={value} />
      ) : id === "delete" ? (
        <FontAwesomeIcon
          icon={faRemove}
          className="removeIcon"
          onClick={deleteApi}
        />
      ) : (
        <input
          value={(value as string) || ""}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => onBlur()}
          className="modalTableInput"
          placeholder={id === "uri" ? "/api" : "getApi"}
        />
      );
    },
  };

  const columns = useMemo<ColumnDef<ApisType>[]>(
    () => [
      {
        accessorKey: "uri",
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "name",
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "method",
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "delete",
        footer: (props) => props.column.id,
        size: 50,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    defaultColumn,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex: string | number, columnId: any, value: any) => {
        if (
          state.data[
            editControllerIndex > -1
              ? editControllerIndex
              : addedControllerIndex
          ].apis.length > 0 &&
          value
        ) {
          state.data[
            editControllerIndex > -1
              ? editControllerIndex
              : addedControllerIndex
          ].apis.map((row, idx) => {
            if (idx === rowIndex) {
              const type = columnId === "uri" ? "uri" : columnId === "name" ? "name" : "method";

              state.data[
                editControllerIndex > -1
                  ? editControllerIndex
                  : addedControllerIndex
              ].apis[rowIndex][type] = value;
            }
          });
        }
      },
    },
    debugTable: true,
  });

  return (
    <table className="modalTable">
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
                  className="tableHeadText"
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  <div
                    {...{
                      onMouseDown: header.getResizeHandler(),
                      onTouchStart: header.getResizeHandler(),
                      className: `resizer ${header.column.getIsResizing() ? "isResizing" : ""}`,
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
                return <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ModalTable;
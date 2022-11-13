import { faTurnUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface Props {
  item: any;
}

const Headers = ({ item }: Props) => {
  return (
    <div>
      <div className="titleContentWrapper">
        <div className="iconTitleWrapper">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <FontAwesomeIcon icon={faTurnUp} rotation={90} />
          &nbsp;headers
        </div>
      </div>
      <div className="contentBox">
        {item.headers.map((item: any, idx: any) => (
          <div key={idx}>
            <div>{"{"}</div>
            <div className="titleContentWrapper2">
              <div>&nbsp;&nbsp;&nbsp;key:</div>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'{item.key}',
            </div>
            <div className="titleContentWrapper2">
              <div>&nbsp;&nbsp;&nbsp;value:</div>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'{item.value}',
            </div>
            <div>{"}"}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Headers;
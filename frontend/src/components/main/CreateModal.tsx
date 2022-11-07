import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { userDummy } from "./ListDummy";
import { useDispatch, useSelector } from "react-redux";
import mainApiSlice, {
  getApiCreationInfo,
  setApiDoc,
} from "../../Store/slice/mainApi";
import { RootState } from "../../Store/store";

export type DocInformationType = {
  docId: number;
  docsName: string;
  serverUrl: string;
  contextUri: string;
  javaVersion: string;
  springVersion: string;
  buildManagement: number;
  groupPackage: string;
  packageName: string;
  packaging: number;
};

const CreateModal = () => {
  const [docsName, setDocsName] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [contextUri, setContextUri] = useState("");
  const [javaVersion, setJavaVersion] = useState("");
  const [springVersion, setSpringVersion] = useState("");
  const [buildManagement, setBuildManagement] = useState("");
  const [groupPackage, setGroupPackage] = useState("");
  const [packageName, setPackageName] = useState("");
  const [packaging, setPackaging] = useState("");
  const [encryptedUrl, setEncryptedUrl] = useState("");
  const [isDefaultAvailable, setIsDefaultAvailable] = useState(false);
  const [creationInfo, setCreationInfo] = useState({} as any);

  const docId = useSelector((state: RootState) => state.mainApi.docId);
  const isOpenCreateModal = useSelector(
    (state: RootState) => state.mainApi.isOpenCreateModal
  );

  const dispatch = useDispatch();

  const canGoNext =
    docsName &&
    serverUrl &&
    contextUri &&
    javaVersion &&
    springVersion &&
    buildManagement &&
    groupPackage &&
    packageName &&
    packaging;

  const createDocRequest = {
    userId: 1,
    docsName: docsName,
    serverUrl: serverUrl,
    contextUri: contextUri,
    javaVersion: javaVersion,
    springVersion: springVersion,
    buildManagement: buildManagement,
    groupPackage: groupPackage,
    packageName: packageName,
    packaging: packaging,
  };

  useEffect(() => {
    dispatch(getApiCreationInfo()).then((res: any) => {
      console.log(res.payload);
      setCreationInfo(res.payload);
      setDocsName(res.payload.name.default);
      setJavaVersion(res.payload.javaVersion.default);
      setSpringVersion(res.payload.bootVersion.default);
      setBuildManagement(res.payload.type.default);
      setPackaging(res.payload.packaging.default);
      setGroupPackage(res.payload.groupId.default);
      setPackageName(res.payload.packageName.default);
      setIsDefaultAvailable(true);
    });
  }, []);

  // API DOC 생성하기
  const onSubmit = (e: any) => {
    e.preventDefault();
    if (docId === 0) {
      dispatch(setApiDoc(createDocRequest)).then((res: any) => {
        if (res.payload?.status === 200) {
          setEncryptedUrl(res.payload.encryptedUrl);
          console.log(res.payload.encryptedUrl);
          dispatch(
            mainApiSlice.actions.setIsOpenCreateModal({ isOpenModal: false })
          );
          dispatch(
            mainApiSlice.actions.setIsDocCreated({ isDocCreated: true })
          );
        }
      });
    }
  };

  return (
    <ModalContainer>
      <DialogBox>
        <div className="modalContainer">
          <div className="modalMain">
            {isDefaultAvailable && (
              <form onSubmit={onSubmit}>
                <p>생성하기</p>
                <input
                  className="docsName"
                  type="text"
                  placeholder="생성할 Docs 명을 작성해주세요"
                  defaultValue={docsName}
                  onChange={(e) => setDocsName(e.target.value)}
                />
                <input
                  className="serverUrl"
                  type="text"
                  placeholder="생성할 serverUrl을 작성해주세요"
                  onChange={(e) => setServerUrl(e.target.value)}
                />
                <input
                  className="contextUrl"
                  type="text"
                  placeholder="생성할 contextUri를 작성해주세요"
                  onChange={(e) => setContextUri(e.target.value)}
                />
                <div>
                  <label>Java Version</label>
                  {creationInfo.javaVersion.values.map((version: any) => (
                    <>
                      <input
                        type="radio"
                        name="javaVersion"
                        id={version.id}
                        value={version.id}
                        checked={javaVersion === version.id}
                        onChange={(e) => setJavaVersion(e.target.value)}
                        key={version.id}
                      />
                      <label htmlFor={version.id}>{version.name}</label>
                    </>
                  ))}
                </div>
                <div>
                  <label>Spring Boot</label>
                  {creationInfo.bootVersion.values.map((version: any) => (
                    <>
                      <input
                        type="radio"
                        name="springVersion"
                        id={version.id}
                        value={version.id}
                        checked={springVersion === version.id}
                        onChange={(e) => setSpringVersion(e.target.value)}
                        key={version.id}
                      />
                      <label htmlFor={version.id}>{version.id}</label>
                    </>
                  ))}
                </div>
                <div>
                  <label>Build Management</label>
                  {creationInfo.type.values.map((type: any) => (
                    <>
                      <input
                        type="radio"
                        name="buildManagement"
                        id={type.id}
                        value={type.id}
                        checked={buildManagement === type.id}
                        onChange={(e) => setBuildManagement(e.target.value)}
                        key={type.id}
                      />
                      <label htmlFor={type.id}>{type.name}</label>
                    </>
                  ))}
                </div>
                <input
                  className="groupPackage"
                  type="text"
                  placeholder="생성할 groupPackage을 작성해주세요"
                  defaultValue={groupPackage}
                  onChange={(e) => setGroupPackage(e.target.value)}
                />
                <input
                  className="packageName"
                  type="text"
                  placeholder="생성할 packageName을 작성해주세요"
                  defaultValue={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                />
                <div>
                  <label>Packaging</label>
                  {creationInfo.packaging.values.map((p: any) => (
                    <>
                      <input
                        type="radio"
                        name="packaging"
                        id={p.id}
                        value={p.id}
                        checked={packaging === p.id}
                        onChange={(e) => setPackaging(e.target.value)}
                        key={p.id}
                      />
                      <label htmlFor={p.id}>{p.name}</label>
                    </>
                  ))}
                </div>
                <p>초대하기</p>
                <input
                  className="groupMember"
                  type="text"
                  placeholder="추가할 사용자의 이메일을 작성해주세요"
                />
                <p>그룹목록</p>
                <p>API 편집 권한이 있는 사용자</p>
                <div className="apiUser">
                  {userDummy.map((it, idx) => (
                    <div className="apiUserList" key={idx}>
                      <FontAwesomeIcon
                        className="apiUserIcon"
                        icon={faCircleUser}
                      />
                      <div className="apiUserTitle">
                        <p>{it.name}</p>
                        <p>{it.id}</p>
                      </div>
                      <p className="apiAuthority">{it.authority}</p>
                    </div>
                  ))}
                </div>
                <div className="modalBtn">
                  <button className="copyBtn">
                    <FontAwesomeIcon icon={faLink} />
                    <span>링크복사</span>
                  </button>
                  <button
                    className="makeBtn"
                    type="submit"
                    disabled={!canGoNext}
                  >
                    완료
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </DialogBox>
      <Backdrop
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
          if (isOpenCreateModal) {
            dispatch(
              mainApiSlice.actions.setIsOpenCreateModal({ isOpenModal: false })
            );
          }
        }}
      />
    </ModalContainer>
  );
};
const ModalContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
`;

const DialogBox = styled.dialog`
  width: 600px;
  height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: none;
  border-radius: 70px;
  box-shadow: 0 0 30px rgba(30, 30, 30, 0.185);
  box-sizing: border-box;
  background-color: white;
  z-index: 10000;
  margin-bottom: 530px;
  margin-right: 550px;
`;

const Backdrop = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  z-index: 9999;
`;

export default CreateModal;

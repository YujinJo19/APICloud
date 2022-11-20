import { Doc } from "yjs";
import { ControllerType } from "./../../pages/CreateApi/ApisType";
import syncedStore, { getYjsValue } from "@syncedstore/core";
import { WebrtcProvider } from "y-webrtc";

export const store = syncedStore({
  data: [] as ControllerType[],
});

const doc = getYjsValue(store);

// const encryptedUrl = window.localStorage.getItem("docId");

export const connect = (encryptedUrl: string) => {
  const webrtcProvider = new WebrtcProvider(
    encryptedUrl.slice(0, 10),
    doc as Doc
  );
};

// export const disconnect = () => webrtcProvider.disconnect();
// export const connect = () => webrtcProvider.connect();

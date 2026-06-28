import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export const listenCollection = (collectionName, callback, onError) => {
  return onSnapshot(
    collection(db, collectionName),
    (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        docId: item.id,
        ...item.data(),
      }));

      callback(data);
    },
    onError
  );
};

export const createDocument = async (collectionName, payload) => {
  return addDoc(collection(db, collectionName), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateDocument = async (collectionName, docId, payload) => {
  return updateDoc(doc(db, collectionName, docId), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
};

export const deleteDocument = async (collectionName, docId) => {
  return deleteDoc(doc(db, collectionName, docId));
};

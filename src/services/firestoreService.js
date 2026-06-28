import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
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

export const setDocument = async (collectionName, docId, payload) => {
  return setDoc(
    doc(db, collectionName, docId),
    {
      ...payload,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
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

export const replaceDocumentsByField = async (
  collectionName,
  fieldName,
  fieldValue,
  items,
  getDocId
) => {
  const batch = writeBatch(db);
  const snapshot = await getDocs(
    query(collection(db, collectionName), where(fieldName, "==", fieldValue))
  );

  snapshot.docs.forEach((item) => batch.delete(item.ref));

  items.forEach((item) => {
    const id = getDocId(item);
    batch.set(doc(db, collectionName, id), {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  return batch.commit();
};

export const replaceCollectionDocuments = async (collectionName, items, getDocId) => {
  const batch = writeBatch(db);
  const snapshot = await getDocs(collection(db, collectionName));

  snapshot.docs.forEach((item) => batch.delete(item.ref));

  items.forEach((item) => {
    batch.set(doc(db, collectionName, getDocId(item)), {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  return batch.commit();
};

export const createSafeDocId = (...parts) =>
  parts
    .map((part) =>
      String(part ?? "")
        .trim()
        .replace(/[^a-zA-Z0-9_-]+/g, "_")
        .replace(/^_+|_+$/g, "")
    )
    .filter(Boolean)
    .join("_");

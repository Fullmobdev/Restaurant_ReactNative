import firebase from 'react-native-firebase';

export const getDatabaseReference = () => {
  return firebase.database().ref();
};

export const getDatabaseReferenceByPath = (path) => {
  return firebase.database().ref(path);
};

export const getDatabaseReferenceByPathAndChild = (path, child) => {
  return firebase.database().ref(path).child(child);
};

export const getDatabaseStorageId = () => {
  return firebase.database().ref().push().key;
};

export const getDatabaseStorageIdByPath = (path) => {
  return firebase.database().ref().child(path).push().key;
};

/**
* Save data in firebase in path specified
* Will override document with new attributes
* only. All other existing attributes not
* present in the data object will be removed.
*/
export const saveData = (data, path) => {
  return new Promise((resolve, reject) => {
    firebase.database().ref(path).set(data)
    .then(() => {
      resolve();
    })
    .catch((error) => {
      reject(error);
    });
  });
};

/**
* Update data in firebase in path specified
* Will only update existing attributes that
* match your input data.
*/
export const updateData = (data, path) => {
  return new Promise((resolve, reject) => {
    firebase.database().ref(path).update(data)
    .then(() => {
      resolve();
    })
    .catch((error) => {
      reject(error);
    });
  });
};

export const updateGroup = (objectsToSave) => {
  return new Promise((resolve, reject) => {
    const Ref = firebase.database().ref();
    Ref.update(objectsToSave)
    .then(() => {
      resolve();
    })
    .catch((error) => {
      reject(error);
    });
  });
};

/**
* Create new data entry in firebase in the
* specified path
*/
export const persistData = (data, path) => {
  return new Promise((resolve, reject) => {
    firebase.database().ref(path).set(data)
    .then(() => {
      resolve();
    })
    .catch((error) => {
      reject(error);
    });
  });
};

export const goOffline = () => {
  firebase.database().goOffline();
};

export const goOnline = () => {
  firebase.database().goOnline();
};

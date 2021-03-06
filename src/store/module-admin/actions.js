import { fireDB, fireAuth, fireStorage } from 'boot/firebase'
// import Vue from 'vue'
import capitalize from 'lodash/capitalize.js'
import { LocalStorage } from 'quasar'
import Vue from 'vue'
import { calCuRounded } from './myJs/roundedValue'

export function saveGradeNow (context, payload) {
  let data = payload
  return new Promise((resolve, reject) => {
    calCuRounded(data).then(function (result) {
      console.log(result.data)
      let docRef = fireDB.collection('studentsSubject').doc(result.data.keyIndex)
      docRef.set(
        {
          keyIndex: result.data.keyIndex,
          classId: result.data.classId,
          studentIndex: result.data.studentIndex,
          prelim: result.data.prelim,
          midterm: result.data.midterm,
          semi: result.data.semi,
          final: result.data.final,
          rounded: result.rounded,
          remarks: result.remarks
        },
        function (error) {
          reject(error)
        }
      )
      resolve()
    })
  })
}

export function deleteMyClassStudents (context, payload) {
  return new Promise((resolve, reject) => {
    console.log(payload)
    fireDB
      .collection('studentsSubject')
      .doc(payload.keyIndex)
      .delete()
      .then(function () {
        context.commit('commitDeleteMyclassStudents', payload)
        resolve(payload)
      })
      .catch(function (error) {
        reject(error)
      })
  })
}

export function getMyclassStudents (context, payload) {
  return new Promise((resolve, reject) => {
    fireAuth.onAuthStateChanged(function (user) {
      if (user) {
        // fireDB.collection('studentsSubject')
        fireDB.collection('classLists/' + payload + '/studentLists')
          .onSnapshot({ includeMetadataChanges: true }, function (snapshot) {
            snapshot.docChanges().forEach(
              function (change) {
                if (change.type === 'added' || change.type === 'modified') {
                  // console.log(change.doc.data(),'test')
                  context.commit('commitGetMyclassStudents', change.doc.data())
                }
                if (change.type === 'modified') {
                  context.commit('commitGetMyclassStudents', change.doc.data())
                }
                if (change.type === 'removed') {
                  context.commit('deleteMyclassStudents', change.doc.data())
                // console.log('Removed data: ', change.doc.data())
                }
                resolve()
              },
              function (error) {
              // The Promise was rejected.
                console.error(error)
                reject('yawa')
              }
            )
          })
      }
    })
  })
}

export function registrarStudentLists ({ commit, state }) {
  return new Promise((resolve, reject) => {
    if (state.studentLists.__ob__.vmCount === 0) {
      fireDB
        .collection('studentLists')
        .onSnapshot(function (snapshot) {
          snapshot.docChanges().forEach(
            function (change) {
              if (change.type === 'added' || change.type === 'modified') {
                // console.log(change.doc.data())
                const data = {
                  id: change.doc.data().keyIndex,
                  information: change.doc.data()
                }
                const fullname = `${change.doc.data().firstname} ${change.doc.data().middlename.charAt(0)}. ${change.doc.data().surname}`

                Vue.set(data.information, 'fullname', fullname)
                commit('commitRegistrarStudentLists', data)
              }
              if (change.type === 'modified') {
              }
              if (change.type === 'removed') {
                // console.log('Removed city: ', change.doc.data())
                commit('commitDeleteStudentLists', change.doc.data())
              }
              resolve()
            },
            function (error) {
              // The Promise was rejected.
              reject()
              console.error(error)
            }
          )
        })
    } else {
      resolve()
    }
  })
  // axios.get('https://firestore.googleapis.com/v1/projects/einstein00-cf6cc/databases/(default)/documents/studentLists?key=AIzaSyDj_LP5qQQjWNA3LQ6D2ojl9GURZXQq-rk&pageSize=600')
  //   .then((response) => {
  //     let data = response.data.documents
  //     console.log(data.length)
  //     context.commit('commitRegistrarStudentLists', data)
  //   })
}

export function addClassStudent (context, payload) {
  return new Promise((resolve, reject) => {
    let docRef = fireDB.collection('studentsSubject/').doc()
    let myId = docRef.id
    docRef.set(
      {
        classId: payload.classId,
        instructorId: payload.instructorId,
        keyIndex: myId,
        studentIndex: payload.data.keyIndex,
        'prelim': null,
        'midterm': null,
        'semi': null,
        'final': null,
        'rounded': null,
        'remarks': null
      },
      function (error) {
        reject(error)
      }
    )
    resolve()
  })
}

// export function getClassListsStudents (context, payload) {
//   fireDB
//     .collection('studentsSubject')
//     .onSnapshot({ includeMetadataChanges: true }, function (snapshot) {
//       snapshot.docChanges().forEach(
//         function (change) {
//           if (change.type === 'added' || change.type === 'modified') {
//             var source = snapshot.metadata.fromCache
//               ? 'local cache'
//               : 'server'
//             console.log('Data came from ' + source)
//             context.commit('commitGetClassListsStudents', change.doc.data())
//           }
//           if (change.type === 'modified') {
//             console.log('Modified data: ', change.doc.data())
//           }
//           if (change.type === 'removed') {
//             context.commit('deleteClassList', change.doc.data())
//             // console.log('Removed data: ', change.doc.data())
//           }
//         },
//         function (error) {
//           // The Promise was rejected.
//           console.error(error)
//         }
//       )
//     })
// }

export function getClassLists ({ commit, state }, payload) {
  console.log(state.userDetails.keyIndex)
  return new Promise((resolve, reject) => {
    fireDB
      .collection('VPAA/subjectSchedules/Lists').where('instructorKeyIndex', '==', state.userDetails.keyIndex)
      .onSnapshot({ includeMetadataChanges: true }, function (snapshot) {
        snapshot.docChanges().forEach(
          function (change) {
            if (change.type === 'added' || change.type === 'modified') {
              console.log(change.doc.data())
              commit('commitGetClassLists', change.doc.data())
            }
            if (change.type === 'modified') {
              console.log('Modified data: ', change.doc.data())
            }
            if (change.type === 'removed') {
              commit('deleteClassList', change.doc.data())
              // console.log('Removed data: ', change.doc.data())
            }
          },
          function (error) {
            // The Promise was rejected.
            reject()
            console.error(error)
          }
        )
        resolve()
      })
  })
}

export function addClassLists (context, payload) {
  return new Promise((resolve, reject) => {
    let userId = fireAuth.currentUser.uid
    let docRef = fireDB.collection('classLists').doc()
    // let docRef = LibraryDB.collection('Statistics').doc('test').doc()
    let myId = docRef.id
    docRef.set(
      {
        instructorIndex: userId,
        keyIndex: myId,
        className: capitalize(payload.className),
        descriptiveTitle: capitalize(payload.DT),
        subjectCode: capitalize(payload.subjectCode),
        room: capitalize(payload.room),
        description: payload.description
      },
      function (error) {
        reject(error)
      }
    )
    resolve(payload)
  })
}

export function updateClassLists (context, payload) {
  return new Promise((resolve, reject) => {
    let userId = fireAuth.currentUser.uid
    let docRef = fireDB.collection('classLists').doc(payload.keyIndex)
    // let docRef = LibraryDB.collection('Statistics').doc('test').doc()
    docRef.update({
      instructorIndex: userId,
      keyIndex: payload.keyIndex,
      className: capitalize(payload.className),
      descriptiveTitle: capitalize(payload.DT),
      subjectCode: capitalize(payload.subjectCode),
      room: capitalize(payload.room),
      description: payload.description
    })
    resolve(payload)
  })
}

export function deleteClassList (context, payload) {
  return new Promise((resolve, reject) => {
    fireDB
      .collection('classLists')
      .doc(payload.keyIndex)
      .delete()
      .then(function () {
        resolve(payload)
      })
      .catch(function (error) {
        reject(error)
      })
  })
}

export function handleAuthStateChanged (context, payload) {
  let vm = this
  fireAuth.onAuthStateChanged(function (user) {
    if (user) {
      // User is Logged in.
      let userId = fireAuth.currentUser.uid
      let phoneNumber = fireAuth.currentUser.phoneNumber
      LocalStorage.set('uid', userId)
      LocalStorage.set('phoneNumber', phoneNumber)

      let userData = fireDB.collection('users').doc(userId)
      userData.get().then(doc => {
        if (!doc.exists) {
          console.log('no such document')
          LocalStorage.set('FirstLogin', true)
          // Login firsttime
        } else {
          console.log('document data: ', doc.data())
          LocalStorage.set('FirstLogin', false)
          context.commit('commitGetUserDetails')
          context.commit('commitGetUserDetails', doc.data())
        }
      })

      // vm.$router.push('/')
    } else {
      context.commit('commitGetUserDetails', {})
      // console.log('No user exist')
      vm.$router.replace('/auth')
    }
  })
}

// export function getFireDetails (context, payload) {
//   fireDB.collection('Registrar/Personnel/Lists')
//      .where("contactNumber", "==", )
//     .onSnapshot({
//       includeMetadataChanges: true
//     }, function (doc) {
//       context.commit('commitGetUserDetails', doc.data())
//     })
// }

export function getFireDetails (context, payload) {
  return new Promise((resolve, reject) => {
    fireDB.collection('Registrar/Personnel/Lists')
      .where('contactNumber', '==', payload.phoneNumber).get()
      .then(snapshot => {
        if (snapshot.empty) {
          console.log('No matching documents.')
          reject(snapshot.empty)
        }
        snapshot.forEach(doc => {
          resolve(doc.data())
          context.commit('commitGetUserDetails', doc.data())
        })
      })
      .catch(err => {
        console.log('Error getting documents', err)
      })
  })
}

export function createNewuser (context, payload) {
  const myid = fireAuth.currentUser.uid
  let docRef = fireDB.collection('users').doc(myid)
  var addData = new Promise(function (resolve, reject) {
    if (payload.profileImgUrl !== '') {
      var uploadTask = fireStorage
        .ref()
        .child('1.InstructorListsImages/' + myid + 'file/' + myid)
        .putString(payload.profileImgUrl, 'data_url')
      uploadTask.on(
        'state_changed',
        function (snapshot) {
          var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log(progress)
          if (progress === 100) {
            resolve()
            // context.commit('commitLoading', false)
          } else {
            // context.commit('commitLoading', true)
          }
          // context.commit('commitLoadingProgress', payload)
        },
        function (error) {
          // Handle unsuccessful uploads
          console.log(error)
          reject()
        },
        function () {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
            docRef.set({
              firstname: capitalize(payload.firstname),
              surname: capitalize(payload.surname),
              email: payload.email,
              password: payload.password,
              phoneNumber: payload.phoneNumber,
              bio: payload.bio,
              keyIndex: myid,
              profileImgUrl: downloadURL
            })
            resolve()
          })
        }
      )
    } else {
      docRef.set({
        firstname: capitalize(payload.firstname),
        surname: capitalize(payload.surname),
        email: payload.email,
        password: payload.password,
        phoneNumber: payload.phoneNumber,
        bio: payload.bio,
        profileImgUrl: 'bsta default',
        keyIndex: myid
      })
      resolve()
    }
  })
  context.dispatch('getFireDetails', myid)
  return addData
}

<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { fireAuth } from 'boot/firebase'
import { mapActions } from 'vuex'
import { QSpinnerFacebook } from 'quasar'
export default {
  name: 'App',
  data () {
    return {
      loadingFire: false
    }
  },
  computed: {
  },
  methods: {
    ...mapActions('admin', ['getFireDetails', 'getClassLists', 'registrarStudentLists'])
  },
  beforeMount () {
    let vm = this
    this.$q.loading.show({
      spinner: QSpinnerFacebook,
      spinnerColor: 'primary',
      backgroundColor: 'transparent'
    })
    fireAuth.onAuthStateChanged(function (user) {
      if (user) {
        vm.$q.loading.hide()
        vm.loadingFire = true
        // console.log(user)
        vm.getFireDetails(user).then(function (result) {
          // console.log(result, 'here')
          vm.getClassLists()
        }, function () {
          vm.$q.notify({
            message: 'Something is wrong!',
            color: 'warning',
            timeout: 2000,
            icon: 'warning'
          })
        })

        // vm.registrarStudentLists()
        // vm.getClassLists()
      } else {
        vm.loadingFire = true
        vm.$q.loading.hide()
        // force logout
        // vm.$router.push('/auth')
      }
    })
  }
}
</script>

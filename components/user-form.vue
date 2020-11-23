<template>

    <b-form @submit="addUser()">

      <div class="row">
        <div class="col-sm">

          <b-form-group label="Name" label-for="input-name">
            <b-form-input id="input-name" v-model="form.name" trim maxlength="32"></b-form-input>
          </b-form-group>

          <b-form-group label="Email"
                        label-for="input-email"
                        v-bind:state="emailIsValid"
                        invalid-feedback="Email is not valid">
            <b-form-input id="input-email" type="email" v-model="form.email" trim></b-form-input>
          </b-form-group>

          <b-form-group label="Password" label-for="input-password" :description="form.password ? 'Please copy this before submitting' : ''">
            <b-input-group>
              <b-form-input id="input-password" type="text" disabled v-model="form.password"></b-form-input>
              <b-input-group-append>
                <b-button v-on:click="generatePassword" variant="secondary">{{ generateOrReset }}</b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>

        </div>

        <div class="col-sm">

          <b-form-group label="Enabled Provinces">
            <b-form-checkbox v-for="(province, index) in provinces"
                            :key="index"
                            v-model="provinces[index].selected"
            ><span class="text-monospace font-weight-bold">{{ province.code }}</span> <span class="text-muted">{{ province.name }}</span></b-form-checkbox>
          </b-form-group>

        </div>
      </div>
      
      <b-button v-on:click="submitForm()"
                v-bind:disabled="!formIsValid || saving"
                variant="primary"
                class="mr-2">{{ addOrEdit }} <strong>{{ form.name }}</strong></b-button>

      <b-button :to="`/users`"
                variant="light"
                v-if="!saving">Cancel</b-button>

      <b-spinner label="Adding user" v-if="saving"></b-spinner>

      <b-alert v-model="alert.show" v-bind:variant="alert.variant || 'info'" dismissible class="mt-3">
        {{ alert.description }}
      </b-alert>

    </b-form>

</template>

<script>
export default {
  middleware: 'auth',
  props: {
    user: {
      type: Object,
      default: () => { return {} },
    },
  },
  data() {
    return {
      form: {
        name: '',
        email: '',
        password: '',
      },
      provinces: [],
      saving: false,
      alert: {
        show: false,
        variant: null,
        description: '',
      },
    }
  },
  created() {
    this.loadProvinces();

    // check for user
    if( this.user.id ) {
      this.form.name = this.user.name;
      this.form.email = this.user.email;
    } else {
      this.generatePassword();
    }

  },
  methods: {

    /**
     * loads initial options
     */
    loadProvinces() {
      this.$axios.$get('provinces', {'params': {'geo_only': 1}})
        .then(response => {
          this.provinces = response;
          // fill selection for edit mode
          if( this.isEdit ) {
            this.user.provinces.map(( province ) => {
              // get index
              let index = this.provinces.findIndex( p => p.id === province.id );
              if( index > -1 ) {
                this.provinces[index].selected = true;
              }
            });
          }
        })
        .catch(errors => {
          console.dir(errors);
        });
    },

    /**
     * helper to generate password
     */
    generatePassword() {
      const len = 16,
            charset = "abcdefghijklmnopqrstuvwxyz0123456789ZYXWVUTSRQPONMLKJIHGFEDCBA9876543210";
      let pw = "";
      for (var i = 0, n = charset.length; i < len; ++i) {
          pw += charset.charAt(Math.floor(Math.random() * n));
      }
      this.form.password = pw;
    },

    copy( obj ) {
      return JSON.parse(JSON.stringify( obj ))
    },

    submitForm() {
      this.saving = true;
      if( this.isAdd )
        this.addUser();
      else
        this.editUser();
    },

    addUser() {
      let payload = this.form;
      payload.provinces = this.selectedProvinces;
      this.$axios.$post( `manage/users/create`, payload )
        .then(response => {
          // redirect back to users
          this.$router.push({
              path: '/users',
              params: { userId: response.id }
          });
        }).catch(error => {
          const response = error.response;
          this.alert.variant = 'danger';
          this.alert.show = true;
          this.alert.description = response.data.message;
          this.saving = false;
        });
    },

    editUser() {
      let payload = this.form;
      payload.provinces = this.selectedProvinces;
      this.$axios.$post( `manage/users/${this.user.id}`, payload )
        .then(response => {
          // redirect back to users
          this.$router.push({
              path: '/users',
              params: { userId: this.user.id }
          });
        }).catch(error => {
          const response = error.response;
          this.alert.variant = 'danger';
          this.alert.show = true;
          this.alert.description = response.data.message;
          this.saving = false;
        });
    },

  },
  computed: {
    isAdd() {
      return this.user.id ? false : true;
    },
    isEdit() {
      return this.user.id ? true : false;
    },
    addOrEdit() {
      return this.isAdd ? 'Add' : 'Edit';
    },
    generateOrReset() {
      return this.isAdd ? 'Generate' : 'Reset Password';
    },
    selectedProvinces() {
      return this.provinces.filter((province) => province.selected )
        .map(province => province.id)
    },
    formIsValid() {
      return this.form.email && this.form.name && this.emailIsValid;
    },
    emailIsValid() {
      if(this.form.email === '')
        return null;
      const re = /\S+@\S+\.\S+/;
      return re.test(this.form.email);
    },
  },
}
</script>

<style>
</style>
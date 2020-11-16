<template>
  <div class="container">

    <div class="d-flex align-items-center justify-content-between mb-4">
      <h1 class="h2">Users</h1>
      <b-button to="users/add" variant="primary">Add User</b-button>
    </div>
    
    <b-table-simple table-class="mb-4">
      <thead>
        <tr>
          <th>&nbsp;</th>
          <th>Name</th>
          <th>Email</th>
          <th>Provinces</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, index) in users"
            :key="index"
            :class="user.isAdmin ? 'text-muted' : ''">
          <td>
            <b-button :to="`users/edit/${user.id}`"
                      :title="`Edit ${user.name}`"
                      :disabled="user.isAdmin"
                      size="sm"
                      variant="light" >
              <iconPencilFill />
            </b-button>
          </td>
          <td class="align-middle">{{ user.name }}</td>
          <td class="align-middle">{{ user.email }}</td>
          <td class="align-middle">
            <span v-if="user.isAdmin" class="font-italic">*all</span>
            <span v-else v-for="(province, index) in user.provinces" :key="index" class="mr-2 font-weight-bold">{{ province.code }}</span>
          </td>
        </tr>
      </tbody>
    </b-table-simple>
  </div>
</template>

<script>
import iconPencilFill from '~/components/icons/pencil-fill.vue';

export default {
  components: {
    iconPencilFill
  },
  middleware: 'auth',
  data() {
    return {
      users: []
    }
  },
  created() {
    this.loadUsers();
  },
  methods: {

    loadUsers() {
      this.$axios.$get(`manage/users`)
        .then(response => {
          response.map((user) => {
            user.isAdmin = this.isAdmin(user);
          }); 
          this.users = response;
        });
    },

    isAdmin(user) {
      if( user.roles ) {
        let f = user.roles.filter( role => role.name === 'admin' );
        console.log(f);
        if( f.length === 1 )
          return true; 
      }
      return false;
    },

  },
}
</script>

<style>
</style>
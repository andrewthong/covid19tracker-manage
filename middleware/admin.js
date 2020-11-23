export default function({ store, redirect }) {
  if (store.state.auth.user.role !== 'admin') {
    return redirect('/')
  }
}
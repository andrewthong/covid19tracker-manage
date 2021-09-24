import amplitude from 'amplitude-js';

export default (context, inject) =>
{
  const ampl = amplitude.getInstance().init("702f5825319376b8cfd21a9e032eb6bf");
  inject('amplitude', amplitude)
}
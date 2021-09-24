import amplitude from 'amplitude-js';

export default (context, inject) =>
{
  const ampl = amplitude.getInstance().init(process.env.AMPLITUDE_API_KEY);
  inject('amplitude', amplitude)
}
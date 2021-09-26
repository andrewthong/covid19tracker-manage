import amplitude from 'amplitude-js';

export default ({$config: { amplitudeKey }}, inject) =>
{
  const ampl = amplitude.getInstance().init(amplitudeKey);
  inject('amplitude', amplitude)
}
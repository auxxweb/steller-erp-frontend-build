import { navIconMap } from './navIconMap.jsx';

function NavIcon({ name }) {
  return navIconMap[name] || navIconMap.dashboard;
}

export default NavIcon;

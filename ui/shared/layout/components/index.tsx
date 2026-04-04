import dynamic from 'next/dynamic';

import Container from './Container';
import Content from './Content';
import MainArea from './MainArea';
import MainColumn from './MainColumn';
import NavBar from './NavBar';
import Root from './Root';
import SideBar from './SideBar';

const Footer = dynamic(() => import('ui/snippets/footer/Footer'), { ssr: false });
const TopRow = dynamic(() => import('ui/snippets/topBar/TopBar'), { ssr: false });

export {
  Root,
  Container,
  Content,
  MainArea,
  SideBar,
  NavBar,
  MainColumn,
  Footer,
  TopRow,
};

// Root
//  Container
//    TopRow
//    MainArea
//       SideBar
//       MainColumn
//          Content
//    Footer

import ReactDOM from 'react-dom';
import Settings from '../../../settings/view/Settings';

type SidebarModalsProps = {
  showSettings: boolean;
  onCloseSettings: () => void;
};

export default function SidebarModals({ showSettings, onCloseSettings }: SidebarModalsProps) {
  if (!showSettings) return null;

  return ReactDOM.createPortal(
    <Settings isOpen={showSettings} onClose={onCloseSettings} />,
    document.body,
  );
}

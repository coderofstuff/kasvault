import { Modal } from '@mantine/core';

import SendForm from '../../components/send-form';

export default function AddressModal(props) {
    return (
        <Modal size={'auto'} centered opened={props.opened} onSuccess={props.onClose}>
            <SendForm addressContext={props.addressContext} />
        </Modal>
    );
}

import { Box, Group, Textarea, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { signMessage } from '../lib/ledger';

import MessageModal from './message-modal';
import { notifications } from '@mantine/notifications';

export default function MessageForm(props) {
    const [signature, setSignature] = useState();
    const [opened, { open, close }] = useDisclosure(false);

    const form = useForm({
        initialValues: {
            message: '',
        },
        validate: {
            message: (value) => (!value ? 'message required' : null),
        },
    });

    useEffect(() => {
        // Reset message
        form.setValues({ message: '' });
        // Close the modal if opened
        if (opened) {
            close();
        }
        // Blank out the signature
        setSignature('');
    }, [props.selectedAddress]);

    const onClickSignMessage = async () => {
        const notifId = notifications.show({
            title: 'Action Required',
            message: 'Please review the message on your device',
            loading: true,
        });

        try {
            const path = props.selectedAddress.derivationPath.split('/');
            const result = await signMessage(form.values.message, Number(path[3]), Number(path[4]));
            setSignature(result.signature);

            open();
        } catch (e) {
            if (e.statusText === 'CONDITIONS_OF_USE_NOT_SATISFIED' && e.message) {
                notifications.show({
                    title: 'Error',
                    message: e.message,
                });
            } else if (e.statusCode == 45073) {
                notifications.show({
                    title: 'Error',
                    message: 'Message too long',
                });
            } else {
                notifications.show({
                    title: 'Error',
                    message: 'Message signing failed',
                });
                console.error(e);
            }
        } finally {
            notifications.hide(notifId);
        }
    };

    return (
        <Box w={'100%'} mx='auto'>
            <Textarea
                label={'Personal Message'}
                placeholder={'Enter the message to sign here'}
                maxLength={200}
                rows={5}
                {...form.getInputProps('message')}
            />

            <Group justify='center' mt='md'>
                <Button onClick={onClickSignMessage} disabled={!form.isValid()}>
                    Sign Message
                </Button>
            </Group>

            <MessageModal
                opened={opened}
                onClose={close}
                message={form.values.message}
                signature={signature}
            />
        </Box>
    );
}

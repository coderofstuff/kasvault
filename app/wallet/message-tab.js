import { Box, Group, Textarea, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { signMessage } from '../../lib/ledger';

import MessageModal from './message-modal';

export default function MessageTab(props) {
    const [signature, setSignature] = useState();
    const [opened, { open, close }] = useDisclosure(false);

    const form = useForm({
        initialValues: {
            message: '',
        },
    });

    const onClickSignMessage = () => {
        const path = props.selectedAddress.derivationPath.split('/');
        signMessage(form.values.message, Number(path[3]), Number(path[4])).then((result) => {
            setSignature(result.signature);

            open();
        });
    };

    return (
        <Box maw={320} mx='auto'>
            <Textarea
                label={'Message'}
                placeholder={'Enter the message to sign here'}
                {...form.getInputProps('message')}
            />

            <Group justify='center' mt='md'>
                <Button onClick={onClickSignMessage}>Sign Message</Button>
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

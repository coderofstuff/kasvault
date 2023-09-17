import { Modal, Stack, CopyButton, Button, Code, Text } from '@mantine/core';

export default function MessageModal(props) {
    return (
        <Modal centered withCloseButton={true} size={'md'} title={'Message Signed'} {...props}>
            <Stack mt='md'>
                <Text size='h2'>Message:</Text>
                <Code block>{props.message}</Code>
                <Text size='h2'>Signature:</Text>
                <Code block>{props.signature}</Code>

                <CopyButton value={props.signature}>
                    {({ copied, copy }) => (
                        <Button color={copied ? 'grey' : 'brand'} onClick={copy}>
                            {copied ? 'Copied!' : 'Copy Signature'}
                        </Button>
                    )}
                </CopyButton>
            </Stack>
        </Modal>
    );
}
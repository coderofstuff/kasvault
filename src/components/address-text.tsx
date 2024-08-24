import { Text } from '@mantine/core';

export default function AddressText(props) {
    if (!props.address) {
        return null;
    }

    const prefLen = props.address.split(':')[0].length;
    const endLen = 8;
    const prefix = props.address.substring(0, prefLen);
    const mid = props.address.substring(prefLen, props.address.length - endLen);
    const end = props.address.substring(props.address.length - endLen, props.address.length);

    return (
        <Text ff={'Roboto Mono,Courier New,Courier,monospace'} component='span'>
            <Text fw='600' c={'brand'} component='span'>
                {prefix}
            </Text>
            <Text fw='600' c={'gray.4'} component='span'>
                {mid}
            </Text>
            <Text fw='600' c={'brand'} component='span'>
                {end}
            </Text>
        </Text>
    );
}

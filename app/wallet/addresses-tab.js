'use client';

import AddressText from '@/components/address-text';
import styles from './addresses-tab.module.css';
import { Button, Group, Loader, ScrollArea, Stack, Table, Text } from '@mantine/core';
import { IconCircleCheckFilled, IconWritingSign } from '@tabler/icons-react';

export default function AddressesTab(props) {
    const width = props.containerWidth;

    const onRowClick = (row) => {
        props.setSelectedAddress(row);
        props.setActiveTab('overview');
    };

    const rows = (props.addresses || []).map((row) => {
        return (
            <Table.Tr
                key={row.key}
                maw={'100%'}
                onClick={() => {
                    onRowClick(row);
                }}
            >
                <Table.Td>
                    <Stack className={styles.small} justify='space-between'>
                        <Text className={styles.address} w={width - 40}>
                            <AddressText address={row.address} />
                        </Text>
                        <Group justify='space-between'>
                            <Group>
                                <Text fw={700}>Balance:</Text>
                                {row.loading ? <Loader size={20} /> : <Text>{row.balance}</Text>}
                            </Group>
                            {/* <Group>
                                <Button size='xs' color='secondary' onClick={(event) => {
                                    event.stopPropagation();
                                    return false;
                                }}>
                                    <IconWritingSign></IconWritingSign> Sign Message
                                </Button>
                            </Group> */}
                        </Group>
                    </Stack>
                </Table.Td>
            </Table.Tr>
        );
    });

    return (
        <>
            <ScrollArea.Autosize mah={600} mx='auto'>
                <Table className={styles.addressTable}>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
            </ScrollArea.Autosize>
        </>
    );
}

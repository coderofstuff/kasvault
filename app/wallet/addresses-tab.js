'use client';

import AddressText from '@/components/address-text';
import styles from './addresses-tab.module.css';
import { Group, Loader, ScrollArea, Stack, Table, Text } from '@mantine/core';
import { IconCircleCheckFilled } from '@tabler/icons-react';
import { useViewportSize } from '@mantine/hooks';

export default function AddressesTab(props) {
    const { width } = useViewportSize();

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
                    <Group className={styles.medium} justify='space-between'>
                        <Text className={styles.address} align='center' justify='center'>
                            {/* <a
                                href={ `https://explorer.kaspa.org/addresses/${row.address}` }
                                target="_blank"
                            >
                                
                            </a> */}
                            <AddressText address={row.address} />
                            {/* <IconCircleCheckFilled size={'1rem'} c={'brand'} display={'inline'} style={{marginLeft: '1rem'}}/> */}
                        </Text>
                        {row.loading ? <Loader size={20} /> : <Text>{row.balance}</Text>}
                    </Group>

                    <Stack className={styles.small} justify='space-between'>
                        <Text className={styles.address} w={width - 40}>
                            {/* <a
                                href={ `https://explorer.kaspa.org/addresses/${row.address}` }
                                target="_blank"
                            >
                                { row.address }
                            </a> */}
                            <AddressText address={row.address} />
                        </Text>
                        <Group>
                            <Text fw={700}>Balance:</Text>
                            <Text> {row.balance}</Text>
                        </Group>
                    </Stack>
                </Table.Td>
            </Table.Tr>
        );
    });

    const thead =
        width > 700 ? (
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>
                        <Group justify='space-between' className={styles.medium}>
                            <Text fw={700}>Address</Text>
                            <Text fw={700}>Balance</Text>
                        </Group>
                    </Table.Th>
                </Table.Tr>
            </Table.Thead>
        ) : null;

    return (
        <>
            <ScrollArea.Autosize mah={600} mx='auto'>
                <Table className={styles.addressTable}>
                    {thead}
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
            </ScrollArea.Autosize>
        </>
    );
}

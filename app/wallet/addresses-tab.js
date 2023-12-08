'use client';

import AddressText from '@/components/address-text';
import styles from './addresses-tab.module.css';
import {
    Badge,
    Box,
    Divider,
    Group,
    Loader,
    ScrollArea,
    Stack,
    Table,
    Text,
    Tooltip,
    UnstyledButton,
} from '@mantine/core';
import { IconCircleCheck, IconEraser } from '@tabler/icons-react';

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
                            {props.selectedAddress &&
                            props.selectedAddress.address === row.address ? (
                                <Badge ml={'1rem'}>Selected</Badge>
                            ) : (
                                ''
                            )}
                        </Text>
                        <Group justify='space-between'>
                            <Group>
                                <Text fw={700}>Balance:</Text>
                                {row.loading ? <Loader size={20} /> : <Text>{row.balance}</Text>}
                            </Group>
                        </Group>
                    </Stack>
                </Table.Td>
            </Table.Tr>
        );
    });

    return (
        <>
            <Box
                style={{
                    padding: 'var(--mantine-spacing-xs)',
                }}
            >
                <Group>
                    <Text fw={600}>Selected Address:</Text>
                    {props.selectedAddress ? (
                        <>
                            <AddressText address={props.selectedAddress.address} />
                            <Tooltip label='Clear Address'>
                                <UnstyledButton
                                    onClick={() => {
                                        props.setSelectedAddress(null);
                                    }}
                                >
                                    <IconEraser />
                                </UnstyledButton>
                            </Tooltip>
                        </>
                    ) : (
                        <Text fs='italic'>Click a row to select an address</Text>
                    )}
                </Group>
            </Box>

            <Divider />

            <ScrollArea.Autosize mah={600} mx='auto'>
                <Table className={styles.addressTable}>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
            </ScrollArea.Autosize>
        </>
    );
}

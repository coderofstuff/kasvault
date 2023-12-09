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
import { IconCircleX } from '@tabler/icons-react';
import { useEffect } from 'react';

export default function AddressesTab(props) {
    const width = props.containerWidth;

    const onRowClick = (row) => {
        props.setSelectedAddress(row);
        props.setActiveTab('overview');
    };

    const rows = (props.addresses || []).map((row) => {
        if (row.address === props.selectedAddress?.address) {
            return null;
        }

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
                        </Group>
                    </Stack>
                </Table.Td>
            </Table.Tr>
        );
    });

    useEffect(() => {
        if (props.addresses?.length === 1) {
            props.setSelectedAddress(props.addresses[0]);
        }
    }, [props.addresses]);

    return (
        <>
            <Box
                style={{
                    padding: 'var(--mantine-spacing-xs)',
                }}
            >
                <Group>
                    {props.selectedAddress ? (
                        <Stack className={styles.small} justify='space-between'>
                            <Text className={styles.address} w={width - 40}>
                                <AddressText address={props.selectedAddress.address} />
                                <Badge
                                    ml={'1rem'}
                                    rightSection={
                                        <Tooltip label='Clear Address'>
                                            <UnstyledButton
                                                style={{
                                                    height: '1rem',
                                                    width: '1rem',
                                                }}
                                                onClick={() => {
                                                    props.setSelectedAddress(null);
                                                }}
                                            >
                                                <IconCircleX
                                                    style={{
                                                        height: '1rem',
                                                        width: '1rem',
                                                    }}
                                                />
                                            </UnstyledButton>
                                        </Tooltip>
                                    }
                                >
                                    Selected
                                </Badge>
                            </Text>
                            <Group justify='space-between'>
                                <Group>
                                    <Text fw={700}>Balance:</Text>
                                    <Text>{props.selectedAddress.balance}</Text>
                                </Group>
                            </Group>
                        </Stack>
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

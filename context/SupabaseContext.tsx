import React, { createContext, useContext, useEffect } from 'react';
import { client } from '../utils/supabaseClient';
import { useAuth } from '@clerk/clerk-expo';
// import { decode } from 'base64-arraybuffer';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Define table names according to your schema
export const USERS_TABLE = 'users';
export const MOVES_TABLE = 'moves';
export const LOCATIONS_TABLE = 'locations';
export const VEHICLES_TABLE = 'vehicles';
export const CHECKLISTS_TABLE = 'checklists';
export const PAYMENTS_TABLE = 'payments';

type ProviderProps = {
    userId: string | null;
    createMove: (data: any) => Promise<any>;
    getMoves: () => Promise<any>;
    updateMove: (id: string, data: any) => Promise<any>;
    deleteMove: (id: string) => Promise<any>;
    getMoveInfo: (moveId: string) => Promise<any>;
    createLocation: (data: any) => Promise<any>;
    getLocations: () => Promise<any>;
    getVehicles: () => Promise<any>;
    createChecklistItem: (data: any) => Promise<any>;
    getChecklistItems: (moveId: string) => Promise<any>;
    updateChecklistItem: (id: string, data: any) => Promise<any>;
    deleteChecklistItem: (id: string) => Promise<any>;
    createPayment: (data: any) => Promise<any>;
    getPayments: () => Promise<any>;
};

const SupabaseContext = createContext<Partial<ProviderProps>>({});

export function useSupabase() {
    return useContext(SupabaseContext);
}

export const SupabaseProvider = ({ children }: any) => {
    const { userId } = useAuth();

    useEffect(() => {
        setRealtimeAuth();
    }, []);

    const setRealtimeAuth = async () => {
        const clerkToken = await window.Clerk.session?.getToken({
            template: 'supabase',
        });

        client.realtime.setAuth(clerkToken!);
    };

    const createMove = async (data: any) => {
        const { data: result, error } = await client
            .from(MOVES_TABLE)
            .insert({ ...data, user_id: userId });

        if (error) {
            console.error('Error creating move:', error);
        }

        return result;
    };

    const getMoves = async () => {
        const { data } = await client
            .from(MOVES_TABLE)
            .select('*')
            .eq('user_id', userId);

        return data || [];
    };

    const updateMove = async (id: string, data: any) => {
        const { data: result } = await client
            .from(MOVES_TABLE)
            .update(data)
            .match({ id })
            .select('*')
            .single();

        return result;
    };

    const deleteMove = async (id: string) => {
        return await client.from(MOVES_TABLE).delete().match({ id });
    };

    const getMoveInfo = async (moveId: string) => {
        const { data } = await client
            .from(MOVES_TABLE)
            .select('*')
            .match({ id: moveId })
            .single();
        return data;
    };

    const createLocation = async (data: any) => {
        const { data: result, error } = await client
            .from(LOCATIONS_TABLE)
            .insert(data);

        if (error) {
            console.error('Error creating location:', error);
        }

        return result;
    };

    const getLocations = async () => {
        const { data } = await client
            .from(LOCATIONS_TABLE)
            .select('*');

        return data || [];
    };

    const getVehicles = async () => {
        const { data } = await client
            .from(VEHICLES_TABLE)
            .select('*');

        return data || [];
    };

    const createChecklistItem = async (data: any) => {
        const { data: result, error } = await client
            .from(CHECKLISTS_TABLE)
            .insert(data);

        if (error) {
            console.error('Error creating checklist item:', error);
        }

        return result;
    };

    const getChecklistItems = async (moveId: string) => {
        const { data } = await client
            .from(CHECKLISTS_TABLE)
            .select('*')
            .eq('move_id', moveId);

        return data || [];
    };

    const updateChecklistItem = async (id: string, data: any) => {
        const { data: result } = await client
            .from(CHECKLISTS_TABLE)
            .update(data)
            .match({ id })
            .select('*')
            .single();

        return result;
    };

    const deleteChecklistItem = async (id: string) => {
        return await client.from(CHECKLISTS_TABLE).delete().match({ id });
    };

    const createPayment = async (data: any) => {
        const { data: result, error } = await client
            .from(PAYMENTS_TABLE)
            .insert(data);

        if (error) {
            console.error('Error creating payment:', error);
        }

        return result;
    };

    const getPayments = async () => {
        const { data } = await client
            .from(PAYMENTS_TABLE)
            .select('*');

        return data || [];
    };

    const value = {
        userId,
        createMove,
        getMoves,
        updateMove,
        deleteMove,
        getMoveInfo,
        createLocation,
        getLocations,
        getVehicles,
        createChecklistItem,
        getChecklistItems,
        updateChecklistItem,
        deleteChecklistItem,
        createPayment,
        getPayments,
    };

    return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
};


// import { createContext, useContext, useEffect } from 'react';
// import { client } from '../utils/supabaseClient';
// import { useAuth } from '@clerk/clerk-expo';
// import { decode } from 'base64-arraybuffer';
// import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// // Define table names according to your schema
// export const USERS_TABLE = 'users';
// export const MOVES_TABLE = 'moves';
// export const LOCATIONS_TABLE = 'locations';
// export const VEHICLES_TABLE = 'vehicles';
// export const CHECKLISTS_TABLE = 'checklists';
// export const PAYMENTS_TABLE = 'payments';

// type ProviderProps = {
//     userId: string | null;
//     createMove: (data: any) => Promise<any>;
//     getMoves: () => Promise<any>;
//     updateMove: (id: string, data: any) => Promise<any>;
//     deleteMove: (id: string) => Promise<any>;
//     getMoveInfo: (moveId: string) => Promise<any>;
//     createLocation: (data: any) => Promise<any>;
//     getLocations: () => Promise<any>;
//     getVehicles: () => Promise<any>;
//     createChecklistItem: (data: any) => Promise<any>;
//     getChecklistItems: (moveId: string) => Promise<any>;
//     updateChecklistItem: (id: string, data: any) => Promise<any>;
//     deleteChecklistItem: (id: string) => Promise<any>;
//     createPayment: (data: any) => Promise<any>;
//     getPayments: () => Promise<any>;
// };

// const SupabaseContext = createContext<Partial<ProviderProps>>({});

// export function useSupabase() {
//     return useContext(SupabaseContext);
// }

// export const SupabaseProvider = ({ children }: any) => {
//     const { userId } = useAuth();

//     useEffect(() => {
//         setRealtimeAuth();
//     }, []);

//     const setRealtimeAuth = async () => {
//         const clerkToken = await window.Clerk.session?.getToken({
//             template: 'supabase',
//         });

//         client.realtime.setAuth(clerkToken!);
//     };

//     const createMove = async (data: any) => {
//         const { data: result, error } = await client
//             .from(MOVES_TABLE)
//             .insert({ ...data, user_id: userId });

//         if (error) {
//             console.error('Error creating move:', error);
//         }

//         return result;
//     };

//     const getMoves = async () => {
//         const { data } = await client
//             .from(MOVES_TABLE)
//             .select('*')
//             .eq('user_id', userId);

//         return data || [];
//     };

//     const updateMove = async (id: string, data: any) => {
//         const { data: result } = await client
//             .from(MOVES_TABLE)
//             .update(data)
//             .match({ id })
//             .select('*')
//             .single();

//         return result;
//     };

//     const deleteMove = async (id: string) => {
//         return await client.from(MOVES_TABLE).delete().match({ id });
//     };

//     const getMoveInfo = async (moveId: string) => {
//         const { data } = await client
//             .from(MOVES_TABLE)
//             .select('*')
//             .match({ id: moveId })
//             .single();
//         return data;
//     };

//     const createLocation = async (data: any) => {
//         const { data: result, error } = await client
//             .from(LOCATIONS_TABLE)
//             .insert(data);

//         if (error) {
//             console.error('Error creating location:', error);
//         }

//         return result;
//     };

//     const getLocations = async () => {
//         const { data } = await client
//             .from(LOCATIONS_TABLE)
//             .select('*');

//         return data || [];
//     };

//     const getVehicles = async () => {
//         const { data } = await client
//             .from(VEHICLES_TABLE)
//             .select('*');

//         return data || [];
//     };

//     const createChecklistItem = async (data: any) => {
//         const { data: result, error } = await client
//             .from(CHECKLISTS_TABLE)
//             .insert(data);

//         if (error) {
//             console.error('Error creating checklist item:', error);
//         }

//         return result;
//     };

//     const getChecklistItems = async (moveId: string) => {
//         const { data } = await client
//             .from(CHECKLISTS_TABLE)
//             .select('*')
//             .eq('move_id', moveId);

//         return data || [];
//     };

//     const updateChecklistItem = async (id: string, data: any) => {
//         const { data: result } = await client
//             .from(CHECKLISTS_TABLE)
//             .update(data)
//             .match({ id })
//             .select('*')
//             .single();

//         return result;
//     };

//     const deleteChecklistItem = async (id: string) => {
//         return await client.from(CHECKLISTS_TABLE).delete().match({ id });
//     };

//     const createPayment = async (data: any) => {
//         const { data: result, error } = await client
//             .from(PAYMENTS_TABLE)
//             .insert(data);

//         if (error) {
//             console.error('Error creating payment:', error);
//         }

//         return result;
//     };

//     const getPayments = async () => {
//         const { data } = await client
//             .from(PAYMENTS_TABLE)
//             .select('*');

//         return data || [];
//     };

//     const value = {
//         userId,
//         createMove,
//         getMoves,
//         updateMove,
//         deleteMove,
//         getMoveInfo,
//         createLocation,
//         getLocations,
//         getVehicles,
//         createChecklistItem,
//         getChecklistItems,
//         updateChecklistItem,
//         deleteChecklistItem,
//         createPayment,
//         getPayments,
//     };

//     return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
// };

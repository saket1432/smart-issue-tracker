
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from './src/screens/WelcomeScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import UserLoginScreen from './src/screens/UserLoginScreen';
import AdminLoginScreen from './src/screens/AdminLoginScreen';

import UserDashboardScreen from './src/screens/UserDashboardScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';

import CreateTicketScreen from './src/screens/CreateTicketScreen';
import MyTicketsScreen from './src/screens/MyTicketsScreen';
import TicketDetailsScreen from './src/screens/TicketDetailsScreen';

import UserManagementScreen from './src/screens/UserManagementScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import SlaManagementScreen from './src/screens/SlaManagementScreen';

import NotificationsScreen from './src/screens/NotificationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#172554',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#F5F7FB',
          },
        }}
      >
        {/* Welcome and Authentication */}
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: 'Create Account' }}
        />

        <Stack.Screen
          name="UserLogin"
          component={UserLoginScreen}
          options={{ title: 'User Login' }}
        />

        <Stack.Screen
          name="AdminLogin"
          component={AdminLoginScreen}
          options={{ title: 'Admin Login' }}
        />

        {/* User Dashboard */}
        <Stack.Screen
          name="UserDashboard"
          component={UserDashboardScreen}
          options={{
            title: 'User Dashboard',
            headerBackVisible: false,
          }}
        />

        {/* Admin Dashboard */}
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{
            title: 'Admin Dashboard',
            headerBackVisible: false,
          }}
        />

        {/* Ticket Management */}
        <Stack.Screen
          name="CreateTicket"
          component={CreateTicketScreen}
          options={{ title: 'Create New Ticket' }}
        />

        <Stack.Screen
          name="MyTickets"
          component={MyTicketsScreen}
          options={{ title: 'Manage Tickets' }}
        />

        <Stack.Screen
          name="TicketDetails"
          component={TicketDetailsScreen}
          options={{ title: 'Ticket Details' }}
        />

        {/* Admin Management */}
        <Stack.Screen
          name="UserManagement"
          component={UserManagementScreen}
          options={{ title: 'Manage Users' }}
        />

        <Stack.Screen
          name="Reports"
          component={ReportsScreen}
          options={{ title: 'Reports & Analytics' }}
        />

        <Stack.Screen
          name="SlaManagement"
          component={SlaManagementScreen}
          options={{ title: 'SLA Policies' }}
        />

        {/* Shared Screens */}
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ title: 'Notifications' }}
        />

        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'My Profile' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

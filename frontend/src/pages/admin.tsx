"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaChartBar,
  FaTrophy,
  FaUsers,
  FaDatabase,
  FaFish,
  FaSpider,
  FaUser,
  FaSearch,
  FaPlus,
  FaTrash,
  FaRedo,
  FaEye
} from 'react-icons/fa';
import StatCard from '../components/StatCard';
import { adminApi, AdminStats, LeaderboardEntry, User, UsersResponse, FishEntry, CrabEntry } from '../utils/adminAPI';

type Tab = 'stats' | 'leaderboards' | 'users' | 'data' | 'admins';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}

function TabButton({ active, onClick, children, icon }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
        active
          ? 'bg-blue-500 text-white shadow-lg'
          : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [leaderboardType, setLeaderboardType] = useState<'fish' | 'crab'>('fish');
  const [leaderboardGamemode, setLeaderboardGamemode] = useState('earth');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [usersPagination, setUsersPagination] = useState<UsersResponse['pagination'] | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [createUserName, setCreateUserName] = useState('');
  const [createUserPassword, setCreateUserPassword] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [viewingUserLoading, setViewingUserLoading] = useState(false);

  const [currentAdmin, setCurrentAdmin] = useState<{ username: string; role: string } | null>(null);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [createAdminUsername, setCreateAdminUsername] = useState('');
  const [createAdminPassword, setCreateAdminPassword] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const [dataUsers, setDataUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedGamemode, setSelectedGamemode] = useState('earth');
  const [fishForm, setFishForm] = useState({ name: '', rarity: 1 });
  const [crabCount, setCrabCount] = useState(1);
  const [userFish, setUserFish] = useState<FishEntry[]>([]);
  const [userCrabs, setUserCrabs] = useState<CrabEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'stats') {
      loadStats();
    } else if (activeTab === 'leaderboards') {
      loadLeaderboard();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'data') {
      loadDataUsers();
    } else if (activeTab === 'admins') {
      loadCurrentAdmin();
    }
  }, [activeTab, refreshTrigger]);

  useEffect(() => {
    if (activeTab === 'leaderboards') {
      loadLeaderboard();
    }
  }, [leaderboardType, leaderboardGamemode]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [currentPage, usersSearch]);

  useEffect(() => {
    if (activeTab === 'data' && selectedUser) {
      loadUserData();
    }
  }, [selectedUser, selectedGamemode]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const data = await adminApi.getStats();
      setStats(data);
    } catch (error) {
      setStatsError(error instanceof Error ? error.message : 'Failed to load stats');
    } finally {
      setStatsLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      const data = await adminApi.getLeaderboard(leaderboardType, leaderboardGamemode);
      setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const data = await adminApi.getUsers(currentPage, 10, usersSearch || undefined);
      setUsers(data.users);
      setUsersPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) return;

    try {
      setLoginLoading(true);
      setLoginError(null);
      await adminApi.login(loginUsername, loginPassword);
      setIsLoggedIn(true);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    adminApi.logout();
    setIsLoggedIn(false);
    setLoginUsername('');
    setLoginPassword('');
    setLoginError(null);
  };

  const loadCurrentAdmin = async () => {
    try {
      const admin = await adminApi.getMe();
      setCurrentAdmin(admin);
    } catch (error) {
      console.error('Failed to load admin info:', error);
      setCurrentAdmin(null);
    }
  };

  const loadDataUsers = async () => {
    try {
      const data = await adminApi.getUsers(1, 100);
      setDataUsers(data.users);
    } catch (error) {
      console.error('Failed to load users for data management:', error);
    }
  };

  const loadUserData = async () => {
    if (!selectedUser) return;

    try {
      setDataLoading(true);
      const [fishData, crabData] = await Promise.all([
        adminApi.getUserFish(selectedUser, selectedGamemode),
        adminApi.getUserCrabs(selectedUser, selectedGamemode)
      ]);
      setUserFish(fishData.fish || []);
      setUserCrabs(crabData.crabs || []);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleAddFish = async () => {
    if (!selectedUser || !fishForm.name.trim()) return;

    try {
      await adminApi.createFish(selectedUser, selectedGamemode, [{
        name: fishForm.name.trim(),
        rarity: fishForm.rarity
      }]);
      setFishForm({ name: '', rarity: 1 });
      await loadUserData();
    } catch (error) {
      alert('Failed to add fish: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleRemoveFish = async (fishId: string) => {
    if (!selectedUser) return;

    try {
      await adminApi.deleteFish(fishId, selectedUser, selectedGamemode);
      await loadUserData();
    } catch (error) {
      alert('Failed to remove fish: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleAddCrabs = async () => {
    if (!selectedUser || crabCount < 1) return;

    try {
      await adminApi.createCrab(selectedUser, selectedGamemode, crabCount);
      setCrabCount(1);
      await loadUserData();
    } catch (error) {
      alert('Failed to add crabs: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleRemoveCrab = async (crabId: string) => {
    if (!selectedUser) return;

    try {
      await adminApi.deleteCrab(crabId, selectedUser, selectedGamemode);
      await loadUserData();
    } catch (error) {
      alert('Failed to remove crab: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingUser(userId);
      await adminApi.deleteUser(userId);
      await loadUsers();
    } catch (error) {
      alert('Failed to delete user: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setDeletingUser(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createUserName.trim()) return;

    try {
      setCreatingUser(true);
      const result = await adminApi.createUser(createUserName, createUserPassword || undefined);
      alert(`User created successfully!\nUsername: ${result.name}\nPassword: ${result.userPassword}\nFernet Key: ${result.fernetKey}`);
      setCreateUserName('');
      setCreateUserPassword('');
      setShowCreateUser(false);
      await loadUsers();
    } catch (error) {
      alert('Failed to create user: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setCreatingUser(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createAdminUsername.trim() || !createAdminPassword.trim()) return;

    try {
      setCreatingAdmin(true);
      const result = await adminApi.createAdmin(createAdminUsername, createAdminPassword);
      alert(`Admin created successfully!\nUsername: ${result.username}\nRole: ${result.role}`);
      setCreateAdminUsername('');
      setCreateAdminPassword('');
      setShowCreateAdmin(false);
    } catch (error) {
      alert('Failed to create admin: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      setViewingUserLoading(true);
      const user = await adminApi.getUserById(userId);
      setViewingUser(user);
    } catch (error) {
      alert('Failed to load user details: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setViewingUserLoading(false);
    }
  };

  const handleResetUser = async (userId: string, type: 'password' | 'fernet') => {
    if (!confirm(`Are you sure you want to reset this user's ${type}?`)) {
      return;
    }

    try {
      const result = await adminApi.resetUser(userId, type);
      if (type === 'password') {
        alert(`Password reset successfully!\nNew password: ${result.newPassword}`);
      } else {
        alert(`Fernet key reset successfully!\nNew key: ${result.newFernetKey}`);
      }
    } catch (error) {
      alert(`Failed to reset ${type}: ` + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const renderStatsTab = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Dashboard Statistics</h2>
        <p className="text-neutral-400">Overview of platform metrics and user activity</p>
      </div>

      {statsLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {statsError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
          <p className="text-red-400">{statsError}</p>
          <button
            onClick={loadStats}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Retry
          </button>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Users"
            value={stats.recentUsers}
            icon={<FaUser />}
            color="blue"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<FaUsers />}
            color="green"
          />
          <StatCard
            title="Total Fish"
            value={stats.totalFish}
            icon={<FaFish />}
            color="purple"
          />
          <StatCard
            title="Total Crabs"
            value={stats.totalCrabs}
            icon={<FaSpider />}
            color="orange"
          />
          <StatCard
            title="Avg Fish/User"
            value={stats.avgFishPerUser}
            icon={<FaChartBar />}
            color="blue"
          />
          <StatCard
            title="Avg Crabs/User"
            value={stats.avgCrabsPerUser}
            icon={<FaChartBar />}
            color="green"
          />
        </div>
      )}
    </div>
  );

  const renderLeaderboardsTab = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Leaderboards</h2>
        <p className="text-neutral-400">Top users ranked by catches</p>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <select
          value={leaderboardType}
          onChange={(e) => setLeaderboardType(e.target.value as 'fish' | 'crab')}
          className="px-4 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="fish">Fish</option>
          <option value="crab">Crabs</option>
        </select>

        <select
          value={leaderboardGamemode}
          onChange={(e) => setLeaderboardGamemode(e.target.value)}
          className="px-4 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="earth">Earth</option>
          <option value="survival">Survival</option>
          <option value="oneblock">OneBlock</option>
          <option value="factions">Factions</option>
        </select>
      </div>

      {leaderboardLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-neutral-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-neutral-300">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-neutral-300">Username</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-neutral-300">Count</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <motion.tr
                    key={entry.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t border-neutral-700 hover:bg-neutral-700/50"
                  >
                    <td className="px-6 py-4 text-sm text-white font-medium">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {entry.userName}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-300">
                      {entry.count.toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">User Management</h2>
        <p className="text-neutral-400">Manage platform users</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={usersSearch}
            onChange={(e) => setUsersSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button 
          onClick={() => setShowCreateUser(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
        >
          <FaPlus />
          Add User
        </button>
      </div>

      {usersLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="bg-neutral-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-neutral-300">Username</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-neutral-300">Joined</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-neutral-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-t border-neutral-700 hover:bg-neutral-700/50"
                    >
                      <td className="px-6 py-4 text-sm text-white font-medium">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleViewUser(user.id)}
                            disabled={viewingUserLoading}
                            className="p-2 bg-neutral-600 text-neutral-300 rounded hover:bg-neutral-500 transition disabled:opacity-50"
                          >
                            <FaEye />
                          </button>
                          <button 
                            onClick={() => handleResetUser(user.id, 'password')}
                            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
                            title="Reset Password"
                          >
                            <FaRedo />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deletingUser === user.id}
                            className="p-2 bg-red-600 text-white rounded hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingUser === user.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <FaTrash />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {usersPagination && usersPagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-neutral-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-600 transition"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-neutral-400">
                Page {currentPage} of {usersPagination.pages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(usersPagination.pages, currentPage + 1))}
                disabled={currentPage === usersPagination.pages}
                className="px-4 py-2 bg-neutral-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-600 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderAdminsTab = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Admin Management</h2>
        <p className="text-neutral-400">Manage admin accounts</p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setShowCreateAdmin(true)}
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition flex items-center gap-2"
        >
          <FaPlus />
          Create Admin
        </button>
      </div>

      {currentAdmin && (
        <div className="bg-neutral-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Current Admin</h3>
          <div className="space-y-2">
            <div>
              <label className="text-sm text-neutral-400">Username</label>
              <p className="text-white font-medium">{currentAdmin.username}</p>
            </div>
            <div>
              <label className="text-sm text-neutral-400">Role</label>
              <p className="text-white font-medium">{currentAdmin.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Data Management</h2>
        <p className="text-neutral-400">Manage fish and crab data</p>
      </div>

      <div className="bg-neutral-800 p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-4">Select User & Gamemode</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a user...</option>
              {dataUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Gamemode</label>
            <select
              value={selectedGamemode}
              onChange={(e) => setSelectedGamemode(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="earth">Earth</option>
              <option value="survival">Survival</option>
              <option value="oneblock">OneBlock</option>
              <option value="factions">Factions</option>
            </select>
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-neutral-800 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FaFish />
              Fish Management
            </h3>

            <div className="space-y-4 mb-6">
              <h4 className="text-lg font-medium text-white">Add Fish</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Fish name"
                  value={fishForm.name}
                  onChange={(e) => setFishForm({ ...fishForm, name: e.target.value })}
                  className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={fishForm.rarity}
                  onChange={(e) => setFishForm({ ...fishForm, rarity: parseInt(e.target.value) })}
                  className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>Bronze</option>
                  <option value={2}>Silver</option>
                  <option value={3}>Gold</option>
                  <option value={4}>Diamond</option>
                  <option value={6}>Platinum</option>
                  <option value={7}>Mythical</option>
                </select>
              </div>
              <button
                onClick={handleAddFish}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Add Fish
              </button>
            </div>

            <div>
              <h4 className="text-lg font-medium text-white mb-4">Remove Fish</h4>
              {dataLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : userFish.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {userFish.map((fish) => {
                    const date = new Date(fish.timestamp).toLocaleDateString();
                    const time = new Date(fish.timestamp).toLocaleTimeString();

                    return (
                      <div key={fish.id} className="flex items-center justify-between bg-neutral-700 p-3 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{fish.name}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              fish.rarity === 'Mythical' ? 'bg-purple-500/20 text-purple-300' :
                              fish.rarity === 'Platinum' ? 'bg-blue-500/20 text-blue-300' :
                              fish.rarity === 'Diamond' ? 'bg-cyan-500/20 text-cyan-300' :
                              fish.rarity === 'Gold' ? 'bg-yellow-500/20 text-yellow-300' :
                              fish.rarity === 'Silver' ? 'bg-gray-500/20 text-gray-300' :
                              fish.rarity === 'Bronze' ? 'bg-orange-500/20 text-orange-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {fish.rarity}
                            </span>
                          </div>
                          <div className="text-neutral-400 text-xs mt-1">
                            Caught on {date} at {time}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFish(fish.id)}
                          className="p-2 bg-red-600 text-white rounded hover:bg-red-500 transition ml-4"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-neutral-400 text-center py-4">No fish found</p>
              )}
            </div>
          </div>

          <div className="bg-neutral-800 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FaSpider />
              Crab Management
            </h3>

            <div className="space-y-4 mb-6">
              <h4 className="text-lg font-medium text-white">Add Crabs</h4>
              <div className="flex gap-4">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={crabCount}
                  onChange={(e) => setCrabCount(parseInt(e.target.value) || 1)}
                  className="flex-1 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleAddCrabs}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  Add Crabs
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-white mb-4">Remove Crabs</h4>
              {dataLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                </div>
              ) : userCrabs.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {userCrabs.slice(0, 2).map((crab) => {
                    const date = new Date(crab.timestamp).toLocaleDateString();
                    const time = new Date(crab.timestamp).toLocaleTimeString();

                    return (
                      <div key={crab.id} className="flex items-center justify-between bg-neutral-700 p-3 rounded-lg">
                        <div className="flex-1">
                          <span className="text-white font-medium">Crab</span>
                          <div className="text-neutral-400 text-xs mt-1">
                            Caught on {date} at {time}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveCrab(crab.id)}
                          className="p-2 bg-red-600 text-white rounded hover:bg-red-500 transition ml-4"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    );
                  })}
                  {userCrabs.length > 2 && (
                    <p className="text-neutral-400 text-center py-2">
                      And {userCrabs.length - 2} remaining crabs...
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-neutral-400 text-center py-4">No crabs found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#0f0f11] to-[#1a1a1d] text-white font-sans flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-neutral-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center space-y-6"
        >
          <h1 className="text-4xl font-bold">Admin Login</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-3 text-base placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-3 text-base placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />

            {loginError && (
              <p className="text-red-400 text-sm">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f0f11] to-[#1a1a1d] text-white font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Admin Dashboard
          </h1>
          <div className="flex justify-center mt-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
          <p className="text-lg mt-4 text-neutral-400">
            Manage users, data, and monitor platform statistics
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <TabButton
            active={activeTab === 'stats'}
            onClick={() => {
              setActiveTab('stats');
              setRefreshTrigger(prev => prev + 1);
            }}
            icon={<FaChartBar />}
          >
            Stats
          </TabButton>
          <TabButton
            active={activeTab === 'leaderboards'}
            onClick={() => {
              setActiveTab('leaderboards');
              setRefreshTrigger(prev => prev + 1);
            }}
            icon={<FaTrophy />}
          >
            Leaderboards
          </TabButton>
          <TabButton
            active={activeTab === 'users'}
            onClick={() => {
              setActiveTab('users');
              setRefreshTrigger(prev => prev + 1);
            }}
            icon={<FaUsers />}
          >
            User Management
          </TabButton>
          <TabButton
            active={activeTab === 'data'}
            onClick={() => {
              setActiveTab('data');
              setRefreshTrigger(prev => prev + 1);
            }}
            icon={<FaDatabase />}
          >
            Data Management
          </TabButton>
          <TabButton
            active={activeTab === 'admins'}
            onClick={() => {
              setActiveTab('admins');
              setRefreshTrigger(prev => prev + 1);
            }}
            icon={<FaUser />}
          >
            Admin Management
          </TabButton>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'stats' && renderStatsTab()}
            {activeTab === 'leaderboards' && renderLeaderboardsTab()}
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'data' && renderDataTab()}
            {activeTab === 'admins' && renderAdminsTab()}
          </motion.div>
        </AnimatePresence>
      </div>

      {showCreateUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Create New User</h3>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={createUserName}
                  onChange={(e) => setCreateUserName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="password"
                  placeholder="Password (optional - auto-generated if empty)"
                  value={createUserPassword}
                  onChange={(e) => setCreateUserPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateUser(false);
                      setCreateUserName('');
                      setCreateUserPassword('');
                    }}
                    className="flex-1 px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-500 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingUser}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                  >
                    {creatingUser ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">User Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-neutral-400">Username</label>
                <p className="text-white font-medium">{viewingUser.name}</p>
              </div>
              <div>
                <label className="text-sm text-neutral-400">User ID</label>
                <p className="text-white font-mono text-sm">{viewingUser.id}</p>
              </div>
              <div>
                <label className="text-sm text-neutral-400">Joined</label>
                <p className="text-white">{new Date(viewingUser.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleResetUser(viewingUser.id, 'password')}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Reset Password
              </button>
              <button
                onClick={() => handleResetUser(viewingUser.id, 'fernet')}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Reset Fernet Key
              </button>
              <button
                onClick={() => setViewingUser(null)}
                className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-500 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Create New Admin</h3>
            <form onSubmit={handleCreateAdmin}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={createAdminUsername}
                  onChange={(e) => setCreateAdminUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={createAdminPassword}
                  onChange={(e) => setCreateAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateAdmin(false);
                      setCreateAdminUsername('');
                      setCreateAdminPassword('');
                    }}
                    className="flex-1 px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-500 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingAdmin}
                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50"
                  >
                    {creatingAdmin ? 'Creating...' : 'Create Admin'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
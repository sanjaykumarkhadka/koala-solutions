import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Card } from '@/components/common/Card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/common/Table';
import { Badge } from '@/components/common/Badge';
import { Avatar } from '@/components/common/Avatar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState, NoDataIcon } from '@/components/common/EmptyState';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/contexts/ToastContext';
import { api, getErrorMessage } from '@/services/api';
import './TeamManagement.css';

interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  _count: {
    assignedLeads: number;
    assignedCases: number;
  };
}

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'AGENT', label: 'Agent' },
  { value: 'COMPANY', label: 'Company' },
  { value: 'APPLICANT', label: 'Applicant' },
];

const roleColors: Record<string, 'info' | 'primary' | 'warning' | 'success' | 'error' | 'default'> = {
  SUPER_ADMIN: 'error',
  ADMIN: 'primary',
  MANAGER: 'warning',
  AGENT: 'info',
  COMPANY: 'default',
  APPLICANT: 'default',
};

const statusColors: Record<string, 'info' | 'primary' | 'warning' | 'success' | 'error' | 'default'> = {
  ACTIVE: 'success',
  INACTIVE: 'error',
  PENDING: 'warning',
};

export function TeamManagement() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { success, error: showError } = useToast();

  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [newMember, setNewMember] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'AGENT',
  });

  const fetchTeam = useCallback(async () => {
    if (!tenantSlug) return;

    setIsLoading(true);
    try {
      const response = await api.get(`/t/${tenantSlug}/admin/team`);
      setTeam(response.data.data);
    } catch (err) {
      showError('Failed to load team', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug, showError]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleInvite = async () => {
    if (!tenantSlug) return;

    setIsInviting(true);
    try {
      const response = await api.post(`/t/${tenantSlug}/admin/team`, newMember);
      success('Team member invited', response.data.message);
      setIsInviteModalOpen(false);
      setNewMember({
        email: '',
        firstName: '',
        lastName: '',
        role: 'AGENT',
      });
      fetchTeam();
    } catch (err) {
      showError('Failed to invite team member', getErrorMessage(err));
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="team-management">
      <PageHeader
        title="Team Management"
        description="Manage your agency's team members"
        actions={
          <Button variant="primary" onClick={() => setIsInviteModalOpen(true)}>
            + Invite Member
          </Button>
        }
      />

      <Card padding="none">
        {isLoading ? (
          <div className="team-loading">
            <LoadingSpinner size="lg" />
          </div>
        ) : team.length === 0 ? (
          <EmptyState
            icon={<NoDataIcon />}
            title="No team members"
            description="Start by inviting your first team member"
            action={{
              label: 'Invite Member',
              onClick: () => setIsInviteModalOpen(true),
            }}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Cases</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="member-info">
                      <Avatar
                        name={`${member.firstName} ${member.lastName}`}
                        src={member.avatarUrl}
                        size="sm"
                      />
                      <div>
                        <span className="member-name">
                          {member.firstName} {member.lastName}
                        </span>
                        <span className="member-email">{member.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleColors[member.role] || 'default'} size="sm">
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[member.status] || 'default'} size="sm">
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{member._count.assignedLeads}</TableCell>
                  <TableCell>{member._count.assignedCases}</TableCell>
                  <TableCell>
                    {member.lastLoginAt
                      ? new Date(member.lastLoginAt).toLocaleDateString()
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    {new Date(member.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Member"
        description="Send an invitation to join your agency"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleInvite} isLoading={isInviting}>
              Send Invitation
            </Button>
          </>
        }
      >
        <div className="invite-form">
          <div className="form-row">
            <Input
              label="First Name"
              value={newMember.firstName}
              onChange={(e) => setNewMember((prev) => ({ ...prev, firstName: e.target.value }))}
              required
            />
            <Input
              label="Last Name"
              value={newMember.lastName}
              onChange={(e) => setNewMember((prev) => ({ ...prev, lastName: e.target.value }))}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={newMember.email}
            onChange={(e) => setNewMember((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <Select
            label="Role"
            options={ROLE_OPTIONS}
            value={newMember.role}
            onChange={(e) => setNewMember((prev) => ({ ...prev, role: e.target.value }))}
            required
          />
        </div>
      </Modal>
    </div>
  );
}

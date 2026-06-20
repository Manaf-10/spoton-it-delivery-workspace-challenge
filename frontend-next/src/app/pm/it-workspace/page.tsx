'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  api,
  CreateQaCheckInput,
  CreateReleaseInput,
  CreateWorkItemInput,
  QaCheck,
  QaCheckStatus,
  Release,
  WorkspaceSummary as WorkspaceSummaryData,
  WorkItem,
  WorkItemStatus,
} from '@/lib/api';
import { QaChecksView } from './components/QaChecksView';
import { ReleasesView } from './components/ReleasesView';
import { WorkItemsView } from './components/WorkItemsView';
import { WorkspaceActions } from './components/WorkspaceActions';
import { WorkspaceFeedback } from './components/WorkspaceFeedback';
import { WorkspaceSummary } from './components/WorkspaceSummary';
import { formatLabel, INITIAL_QA_FORM, INITIAL_RELEASE_FORM, INITIAL_WORK_ITEM_FORM } from './constants';
import type { WorkItemFiltersState, WorkspaceView } from './types';

const trimmedLength = (value = '') => value.trim().length;

const ItWorkspacePage = () => {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [workspaceSummary, setWorkspaceSummary] = useState<WorkspaceSummaryData | null>(null);
  const [form, setForm] = useState<CreateWorkItemInput>(INITIAL_WORK_ITEM_FORM);
  const [selectedWorkItemId, setSelectedWorkItemId] = useState('');
  const [qaChecks, setQaChecks] = useState<QaCheck[]>([]);
  const [qaLoading, setQaLoading] = useState(false);
  const [qaSaving, setQaSaving] = useState(false);
  const [qaForm, setQaForm] = useState<CreateQaCheckInput>(INITIAL_QA_FORM);
  const [releases, setReleases] = useState<Release[]>([]);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [releaseSaving, setReleaseSaving] = useState(false);
  const [releaseForm, setReleaseForm] = useState<CreateReleaseInput>(INITIAL_RELEASE_FORM);
  const [activeView, setActiveView] = useState<WorkspaceView>('work-items');
  const [filters, setFilters] = useState<WorkItemFiltersState>({
    status: '',
    priority: '',
    assignee: '',
    search: '',
  });

  const filteredAssignees = useMemo(() => {
    return Array.from(new Set(workItems.map((item) => item.assignee).filter(Boolean))).sort();
  }, [workItems]);

  const summary = useMemo(() => {
    if (workspaceSummary) {
      return {
        total: workspaceSummary.counts.totalWorkItems,
        active: workspaceSummary.counts.activeWorkItems,
        ready: workspaceSummary.counts.readyWorkItems,
        released: workspaceSummary.counts.releasedWorkItems,
      };
    }

    return {
      total: workItems.length,
      active: workItems.filter((item) => !['ready_for_release', 'released'].includes(item.status)).length,
      ready: workItems.filter((item) => item.status === 'ready_for_release').length,
      released: workItems.filter((item) => item.status === 'released').length,
    };
  }, [workItems, workspaceSummary]);

  const selectedWorkItem = useMemo(() => {
    return workItems.find((item) => item.id === selectedWorkItemId) ?? null;
  }, [selectedWorkItemId, workItems]);

  const qaSummary = useMemo(() => {
    const passed = qaChecks.filter((check) => check.status === 'passed').length;
    const failed = qaChecks.filter((check) => check.status === 'failed').length;

    return {
      total: qaChecks.length,
      passed,
      failed,
      pending: qaChecks.length - passed - failed,
    };
  }, [qaChecks]);

  const readyWorkItems = useMemo(() => {
    return workItems.filter((item) => item.status === 'ready_for_release');
  }, [workItems]);

  const loadWorkItems = async () => {
    setLoading(true);
    setError('');

    try {
      const items = await api.listWorkItems({
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        assignee: filters.assignee || undefined,
        search: filters.search || undefined,
      });
      setWorkItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load work items');
    } finally {
      setLoading(false);
    }
  };

  const loadQaChecks = async (workItemId = selectedWorkItemId) => {
    if (!workItemId) {
      setQaChecks([]);
      return;
    }

    setQaLoading(true);
    setError('');

    try {
      const checks = await api.listQaChecks({ workItemId });
      setQaChecks(checks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load QA checks');
    } finally {
      setQaLoading(false);
    }
  };

  const loadReleases = async () => {
    setReleaseLoading(true);
    setError('');

    try {
      const loadedReleases = await api.listReleases();
      setReleases(loadedReleases);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load releases');
    } finally {
      setReleaseLoading(false);
    }
  };

  const loadWorkspaceSummary = async () => {
    try {
      const loadedSummary = await api.workspaceSummary();
      setWorkspaceSummary(loadedSummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workspace summary');
    }
  };

  useEffect(() => {
    void loadWorkItems();
  }, [filters.status, filters.priority, filters.assignee]);

  useEffect(() => {
    void loadReleases();
  }, []);

  useEffect(() => {
    void loadWorkspaceSummary();
  }, []);

  useEffect(() => {
    api.me()
      .then((user) => {
        setCurrentUserName(user.name);
        setForm((currentForm) => ({
          ...currentForm,
          assignee: currentForm.assignee || user.name,
        }));
        setQaForm((currentForm) => ({
          ...currentForm,
          tester: currentForm.tester || user.name,
        }));
      })
      .catch(() => {
        setCurrentUserName('');
      });
  }, []);

  const submitWorkItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextForm = {
      ...form,
      assignee: form.assignee.trim(),
      description: form.description.trim(),
      title: form.title.trim(),
    };

    if (trimmedLength(nextForm.title) < 3) {
      setError('Work item title must be at least 3 characters.');
      setSuccess('');
      return;
    }

    if (trimmedLength(nextForm.description) < 5) {
      setError('Work item description must be at least 5 characters.');
      setSuccess('');
      return;
    }

    if (!nextForm.assignee) {
      setError('Work item assignee is required.');
      setSuccess('');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.createWorkItem({
        ...nextForm,
        dueDate: nextForm.dueDate || undefined,
      });
      setForm({ ...INITIAL_WORK_ITEM_FORM, assignee: currentUserName });
      setSuccess('Work item created.');
      await Promise.all([loadWorkItems(), loadWorkspaceSummary()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create work item');
    } finally {
      setSaving(false);
    }
  };

  const selectWorkItemForQa = async (workItem: WorkItem) => {
    setActiveView('qa-checks');
    setSelectedWorkItemId(workItem.id);
    setQaForm((currentForm) => ({
      ...currentForm,
      workItemId: workItem.id,
      tester: currentForm.tester || currentUserName,
    }));
    await loadQaChecks(workItem.id);
  };

  const clearQaSelection = () => {
    setSelectedWorkItemId('');
    setQaChecks([]);
  };

  const submitQaCheck = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedWorkItem) {
      setError('Select a work item before adding QA checks');
      return;
    }

    const nextQaForm = {
      ...qaForm,
      actualResult: qaForm.actualResult?.trim(),
      expectedResult: qaForm.expectedResult.trim(),
      notes: qaForm.notes?.trim(),
      testTitle: qaForm.testTitle.trim(),
      tester: qaForm.tester.trim(),
    };

    if (trimmedLength(nextQaForm.testTitle) < 3) {
      setError('QA test title must be at least 3 characters.');
      setSuccess('');
      return;
    }

    if (trimmedLength(nextQaForm.expectedResult) < 3) {
      setError('QA expected result must be at least 3 characters.');
      setSuccess('');
      return;
    }

    if (!nextQaForm.tester) {
      setError('QA tester is required.');
      setSuccess('');
      return;
    }

    setQaSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.createQaCheck({
        ...nextQaForm,
        workItemId: selectedWorkItem.id,
        actualResult: nextQaForm.actualResult || undefined,
        notes: nextQaForm.notes || undefined,
      });
      setQaForm({
        ...INITIAL_QA_FORM,
        workItemId: selectedWorkItem.id,
        tester: currentUserName,
      });
      setSuccess(`QA check added for "${selectedWorkItem.title}".`);
      await Promise.all([loadQaChecks(selectedWorkItem.id), loadWorkspaceSummary()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create QA check');
    } finally {
      setQaSaving(false);
    }
  };

  const updateQaStatus = async (qaCheck: QaCheck, status: QaCheckStatus) => {
    setError('');
    setSuccess('');

    try {
      await api.updateQaCheck(qaCheck.id, { status });
      setSuccess(`Updated QA check to ${formatLabel(status)}.`);
      await loadQaChecks(qaCheck.workItemId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update QA check');
    }
  };

  const submitRelease = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextReleaseForm = {
      ...releaseForm,
      summary: releaseForm.summary.trim(),
      version: releaseForm.version.trim(),
    };

    if (trimmedLength(nextReleaseForm.version) < 2) {
      setError('Release version must be at least 2 characters.');
      setSuccess('');
      return;
    }

    if (trimmedLength(nextReleaseForm.summary) < 5) {
      setError('Release summary must be at least 5 characters.');
      setSuccess('');
      return;
    }

    if (!nextReleaseForm.linkedWorkItemIds?.length) {
      setError('Select at least one ready work item before creating a release.');
      setSuccess('');
      return;
    }

    setReleaseSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.createRelease({
        ...nextReleaseForm,
        linkedWorkItemIds: nextReleaseForm.linkedWorkItemIds,
      });
      setReleaseForm(INITIAL_RELEASE_FORM);
      setSuccess('Release created.');
      await Promise.all([loadReleases(), loadWorkspaceSummary()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create release');
    } finally {
      setReleaseSaving(false);
    }
  };

  const deployRelease = async (release: Release) => {
    setError('');
    setSuccess('');

    try {
      await api.deployRelease(release.id);
      setSuccess(`Deployed ${release.version}.`);
      await Promise.all([loadReleases(), loadWorkItems(), loadWorkspaceSummary()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deploy release');
    }
  };

  const updateStatus = async (workItem: WorkItem, status: WorkItemStatus) => {
    setError('');
    setSuccess('');

    try {
      if (status === 'ready_for_release') {
        const checks = await api.listQaChecks({ workItemId: workItem.id });

        if (!checks.length) {
          setError('Add at least one QA check before moving this work item to ready for release.');
          return;
        }

        if (checks.some((check) => check.status !== 'passed')) {
          setError('All QA checks must be passed before moving this work item to ready for release.');
          return;
        }
      }

      await api.updateWorkItem(workItem.id, { status });
      setSuccess(`Moved "${workItem.title}" to ${formatLabel(status)}.`);
      await Promise.all([loadWorkItems(), loadWorkspaceSummary()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update work item status');
    }
  };

  const removeWorkItem = async (workItem: WorkItem) => {
    setError('');
    setSuccess('');

    try {
      await api.deleteWorkItem(workItem.id);
      setSuccess(`Deleted "${workItem.title}".`);
      await Promise.all([loadWorkItems(), loadWorkspaceSummary()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete work item');
    }
  };

  return (
    <section aria-label="IT Delivery Workspace">
      <div className="page-header">
        <div>
          <div className="eyebrow">IT Delivery Workspace</div>
          <h1>Work items</h1>
          <p>Plan, assign, and move engineering work through the delivery workflow.</p>
        </div>
      </div>

      <WorkspaceSummary {...summary} />

      <WorkspaceActions
        activeView={activeView}
        loading={loading}
        onRefresh={loadWorkItems}
        onViewChange={setActiveView}
      />

      <WorkspaceFeedback error={error} success={success} />

      {activeView === 'work-items' ? (
        <WorkItemsView
          filteredAssignees={filteredAssignees}
          filters={filters}
          form={form}
          loading={loading}
          saving={saving}
          workItems={workItems}
          onCreate={submitWorkItem}
          onDelete={removeWorkItem}
          onFilterChange={setFilters}
          onFormChange={setForm}
          onRefresh={loadWorkItems}
          onSelectQa={selectWorkItemForQa}
          onStatusChange={updateStatus}
        />
      ) : null}

      {activeView === 'qa-checks' ? (
        <QaChecksView
          currentUserName={currentUserName}
          qaChecks={qaChecks}
          qaForm={qaForm}
          qaLoading={qaLoading}
          qaSaving={qaSaving}
          qaSummary={qaSummary}
          selectedWorkItem={selectedWorkItem}
          selectedWorkItemId={selectedWorkItemId}
          workItems={workItems}
          onClearSelection={clearQaSelection}
          onQaFormChange={setQaForm}
          onRefresh={() => void loadQaChecks()}
          onSelectWorkItem={(workItem) => void selectWorkItemForQa(workItem)}
          onSubmit={submitQaCheck}
          onUpdateStatus={updateQaStatus}
        />
      ) : null}

      {activeView === 'releases' ? (
        <ReleasesView
          form={releaseForm}
          loading={releaseLoading}
          readyWorkItems={readyWorkItems}
          releases={releases}
          saving={releaseSaving}
          onDeploy={deployRelease}
          onFormChange={setReleaseForm}
          onRefresh={loadReleases}
          onSubmit={submitRelease}
        />
      ) : null}
    </section>
  );
};

export default ItWorkspacePage;

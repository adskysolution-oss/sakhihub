import User from '@/models/User';

/**
 * Checks if the given employee reports to the given coordinator.
 * Scopes reports by block case-insensitively.
 */
export async function isReportingEmployee(coordinator: any, employee: any): Promise<boolean> {
  if (!coordinator || !employee) return false;

  const isDC = ['District Coordinator', 'District Project Officer'].includes(coordinator.designation || '');
  if (!isDC) return false;

  const assignedBlocks = (coordinator.assignedBlocks || []).map((b: string) => b.trim().toLowerCase());
  const isBlockEmployee = ['Block Coordinator', 'Field Executive'].includes(employee.designation || '');
  const hasMatchingBlock = 
    assignedBlocks.includes((employee.workBlock || '').trim().toLowerCase()) || 
    assignedBlocks.includes((employee.block || '').trim().toLowerCase());

  return employee.role === 'employee' && isBlockEmployee && hasMatchingBlock;
}

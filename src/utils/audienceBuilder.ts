import dbConnect from '@/lib/dbConnect';
import SecurityDeposit from '@/models/SecurityDeposit';

export interface Rule {
  field: string;
  operator: 'equals' | 'contains' | 'between' | 'in';
  value: any;
}

export interface FilterGroup {
  condition: 'AND' | 'OR';
  rules: (Rule | FilterGroup)[];
}

/**
 * Translates a single audience rule into a Mongoose query condition.
 */
async function translateRuleToMongo(rule: Rule): Promise<any> {
  const { field, value } = rule;

  switch (field) {
    case 'role':
      return { role: value };

    case 'status':
      return { status: value.toLowerCase() };

    case 'paymentStatus':
      if (value === 'paid') {
        return {
          $or: [
            { paymentStatus: 'completed' },
            { subscriptionPaid: true },
            { paymentCompleted: true }
          ]
        };
      } else {
        // unpaid or pending
        return {
          $or: [
            { paymentStatus: 'pending' },
            { paymentStatus: { $exists: false } },
            { paymentCompleted: false },
            { subscriptionPaid: false }
          ]
        };
      }

    case 'verificationStatus':
      if (value === 'verified') {
        return {
          $or: [
            { verificationStatus: 'verified' },
            { isVerified: true },
            { documentsVerified: true }
          ]
        };
      } else {
        // unverified
        return {
          $or: [
            { verificationStatus: 'pending' },
            { isVerified: false },
            { documentsVerified: false }
          ]
        };
      }

    case 'designation':
      return { designation: { $regex: value, $options: 'i' } };

    // Locations
    case 'country':
      // The platform is currently focused in India. Map to address/state regex check or generic match
      return { address: { $regex: value || 'India', $options: 'i' } };
    case 'state':
      return {
        $or: [
          { state: { $regex: value, $options: 'i' } },
          { workState: { $regex: value, $options: 'i' } }
        ]
      };
    case 'district':
      return {
        $or: [
          { district: { $regex: value, $options: 'i' } },
          { workDistrict: { $regex: value, $options: 'i' } }
        ]
      };
    case 'block':
      return {
        $or: [
          { block: { $regex: value, $options: 'i' } },
          { workBlock: { $regex: value, $options: 'i' } }
        ]
      };
    case 'area':
    case 'village':
      return {
        $or: [
          { area: { $regex: value, $options: 'i' } },
          { workArea: { $regex: value, $options: 'i' } },
          { address: { $regex: value, $options: 'i' } },
          { workTehsil: { $regex: value, $options: 'i' } }
        ]
      };

    // Date
    case 'registrationDate':
      if (value && (value.start || value.end)) {
        const dateQuery: any = {};
        if (value.start) dateQuery.$gte = new Date(value.start);
        if (value.end) {
          const endOfDay = new Date(value.end);
          endOfDay.setHours(23, 59, 59, 999);
          dateQuery.$lte = endOfDay;
        }
        return { createdAt: dateQuery };
      }
      return {};

    // Security Deposit Filters
    case 'securityDeposit':
      if (value === 'paid') {
        return { depositPaid: true };
      } else if (value === 'pending') {
        return { depositPaid: false };
      } else if (value === 'eligible' || value === 'refunded') {
        const status = value === 'eligible' ? 'eligible' : 'processed';
        
        // Find deposits that have this refund status
        const deposits = await SecurityDeposit.find({ refundStatus: status }).select('vendorId').lean();
        const vendorIds = deposits.map(d => d.vendorId);
        return { _id: { $in: vendorIds } };
      }
      return {};

    default:
      return {};
  }
}

/**
 * Recursively translates a UI filter group tree into a MongoDB query block.
 */
export async function translateFiltersToMongoQuery(group: FilterGroup | null | undefined): Promise<any> {
  if (!group || !group.rules || group.rules.length === 0) {
    return {};
  }

  const list: any[] = [];

  for (const rule of group.rules) {
    if ('condition' in rule) {
      // It's a nested filter group
      const subQuery = await translateFiltersToMongoQuery(rule as FilterGroup);
      if (Object.keys(subQuery).length > 0) {
        list.push(subQuery);
      }
    } else {
      // It's a simple rule
      const ruleQuery = await translateRuleToMongo(rule as Rule);
      if (Object.keys(ruleQuery).length > 0) {
        list.push(ruleQuery);
      }
    }
  }

  if (list.length === 0) {
    return {};
  }

  if (group.condition === 'OR') {
    return { $or: list };
  } else {
    return { $and: list };
  }
}

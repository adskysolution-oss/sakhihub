import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  category: 'payment' | 'employee' | 'campaign' | 'document' | 'technical' | 'other';
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['payment', 'employee', 'campaign', 'document', 'technical', 'other'], 
      required: true 
    },
    description: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['open', 'in_progress', 'resolved'], 
      default: 'open' 
    },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high'], 
      default: 'medium' 
    },
    adminResponse: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

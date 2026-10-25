import {Slot} from '@radix-ui/react-slot';
import {cva,type VariantProps} from 'class-variance-authority';
import {cn} from '@/lib/utils';
import type {ButtonHTMLAttributes} from 'react';
const styles=cva('btn',{variants:{variant:{default:'btn-primary',secondary:'btn-secondary',ghost:'btn-ghost',outline:'btn-outline',danger:'btn-danger'},size:{default:'',sm:'btn-sm',icon:'btn-icon'}},defaultVariants:{variant:'default',size:'default'}});
export function Button({className,variant,size,asChild=false,...props}:ButtonHTMLAttributes<HTMLButtonElement>&VariantProps<typeof styles>&{asChild?:boolean}){const Comp=asChild?Slot:'button';return <Comp className={cn(styles({variant,size}),className)} {...props}/>;}

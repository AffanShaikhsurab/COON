"""
Performance metrics and analytics
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional
from datetime import datetime
import json
from pathlib import Path


@dataclass
class CompressionMetric:
    """Single compression operation metric"""
    timestamp: str
    strategy_used: str
    original_tokens: int
    compressed_tokens: int
    compression_ratio: float
    processing_time_ms: float
    code_size_bytes: int
    success: bool
    reversible: bool
    error_message: Optional[str] = None
    
    @property
    def tokens_saved(self) -> int:
        """Calculate tokens saved"""
        return self.original_tokens - self.compressed_tokens
    
    @property
    def percentage_saved(self) -> float:
        """Calculate percentage saved"""
        return self.compression_ratio * 100


@dataclass
class MetricsCollector:
    """Collects and analyzes compression metrics"""
    metrics: List[CompressionMetric] = field(default_factory=list)
    storage_path: Optional[str] = None
    
    def record(
        self,
        strategy_used: str,
        original_tokens: int,
        compressed_tokens: int,
        compression_ratio: float,
        processing_time_ms: float,
        code_size_bytes: int,
        success: bool,
        reversible: bool,
        error_message: Optional[str] = None
    ):
        """Record a compression metric"""
        metric = CompressionMetric(
            timestamp=datetime.now().isoformat(),
            strategy_used=strategy_used,
            original_tokens=original_tokens,
            compressed_tokens=compressed_tokens,
            compression_ratio=compression_ratio,
            processing_time_ms=processing_time_ms,
            code_size_bytes=code_size_bytes,
            success=success,
            reversible=reversible,
            error_message=error_message
        )
        self.metrics.append(metric)
        
        # Auto-save if storage path is set
        if self.storage_path:
            self.save()
    
    def get_summary(self) -> Dict:
        """Get summary statistics"""
        if not self.metrics:
            return {
                'total_compressions': 0,
                'success_rate': 0.0,
                'reversibility_rate': 0.0,
                'avg_compression_ratio': 0.0,
                'avg_tokens_saved': 0,
                'avg_processing_time_ms': 0.0,
                'total_tokens_saved': 0
            }
        
        successful = [m for m in self.metrics if m.success]
        reversible = [m for m in self.metrics if m.reversible]
        
        total_tokens_saved = sum(m.tokens_saved for m in successful)
        avg_compression_ratio = sum(m.compression_ratio for m in successful) / len(successful) if successful else 0.0
        avg_tokens_saved = total_tokens_saved // len(successful) if successful else 0
        avg_processing_time = sum(m.processing_time_ms for m in self.metrics) / len(self.metrics)
        
        return {
            'total_compressions': len(self.metrics),
            'successful_compressions': len(successful),
            'failed_compressions': len(self.metrics) - len(successful),
            'success_rate': len(successful) / len(self.metrics) * 100,
            'reversibility_rate': len(reversible) / len(self.metrics) * 100 if self.metrics else 0.0,
            'avg_compression_ratio': avg_compression_ratio,
            'avg_percentage_saved': avg_compression_ratio * 100,
            'avg_tokens_saved': avg_tokens_saved,
            'avg_processing_time_ms': avg_processing_time,
            'total_tokens_saved': total_tokens_saved,
            'total_original_tokens': sum(m.original_tokens for m in self.metrics),
            'total_compressed_tokens': sum(m.compressed_tokens for m in successful)
        }
    
    def get_strategy_breakdown(self) -> Dict[str, Dict]:
        """Get metrics broken down by strategy"""
        strategy_metrics = {}
        
        for metric in self.metrics:
            strategy = metric.strategy_used
            if strategy not in strategy_metrics:
                strategy_metrics[strategy] = []
            strategy_metrics[strategy].append(metric)
        
        breakdown = {}
        for strategy, metrics in strategy_metrics.items():
            successful = [m for m in metrics if m.success]
            
            if successful:
                avg_ratio = sum(m.compression_ratio for m in successful) / len(successful)
                avg_tokens = sum(m.tokens_saved for m in successful) // len(successful)
            else:
                avg_ratio = 0.0
                avg_tokens = 0
            
            breakdown[strategy] = {
                'count': len(metrics),
                'successful': len(successful),
                'success_rate': len(successful) / len(metrics) * 100 if metrics else 0.0,
                'avg_compression_ratio': avg_ratio,
                'avg_tokens_saved': avg_tokens,
                'total_tokens_saved': sum(m.tokens_saved for m in successful)
            }
        
        return breakdown
    
    def get_cost_savings(
        self,
        input_cost_per_1k: float = 0.03,
        output_cost_per_1k: float = 0.06
    ) -> Dict:
        """
        Calculate cost savings based on token reduction
        
        Args:
            input_cost_per_1k: Cost per 1000 input tokens (default GPT-4 pricing)
            output_cost_per_1k: Cost per 1000 output tokens (default GPT-4 pricing)
            
        Returns:
            Dictionary with cost savings metrics
        """
        summary = self.get_summary()
        total_tokens_saved = summary['total_tokens_saved']
        
        # Assume 50/50 split between input and output for simplicity
        input_tokens_saved = total_tokens_saved // 2
        output_tokens_saved = total_tokens_saved // 2
        
        input_cost_saved = (input_tokens_saved / 1000) * input_cost_per_1k
        output_cost_saved = (output_tokens_saved / 1000) * output_cost_per_1k
        total_cost_saved = input_cost_saved + output_cost_saved
        
        return {
            'total_tokens_saved': total_tokens_saved,
            'input_tokens_saved': input_tokens_saved,
            'output_tokens_saved': output_tokens_saved,
            'input_cost_saved_usd': input_cost_saved,
            'output_cost_saved_usd': output_cost_saved,
            'total_cost_saved_usd': total_cost_saved,
            'input_cost_per_1k': input_cost_per_1k,
            'output_cost_per_1k': output_cost_per_1k
        }
    
    def get_recent_metrics(self, count: int = 10) -> List[CompressionMetric]:
        """Get most recent metrics"""
        return self.metrics[-count:] if len(self.metrics) >= count else self.metrics
    
    def get_failed_compressions(self) -> List[CompressionMetric]:
        """Get all failed compressions"""
        return [m for m in self.metrics if not m.success]
    
    def clear(self):
        """Clear all metrics"""
        self.metrics.clear()
    
    def save(self, filepath: Optional[str] = None):
        """Save metrics to JSON file"""
        target_path = filepath or self.storage_path
        if not target_path:
            raise ValueError("No storage path specified")
        
        data = {
            'version': '1.0.0',
            'metrics': [
                {
                    'timestamp': m.timestamp,
                    'strategy_used': m.strategy_used,
                    'original_tokens': m.original_tokens,
                    'compressed_tokens': m.compressed_tokens,
                    'compression_ratio': m.compression_ratio,
                    'processing_time_ms': m.processing_time_ms,
                    'code_size_bytes': m.code_size_bytes,
                    'success': m.success,
                    'reversible': m.reversible,
                    'error_message': m.error_message
                }
                for m in self.metrics
            ]
        }
        
        # Ensure directory exists
        Path(target_path).parent.mkdir(parents=True, exist_ok=True)
        
        with open(target_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def load(self, filepath: Optional[str] = None):
        """Load metrics from JSON file"""
        target_path = filepath or self.storage_path
        if not target_path:
            raise ValueError("No storage path specified")
        
        if not Path(target_path).exists():
            return
        
        with open(target_path, 'r') as f:
            data = json.load(f)
        
        self.metrics = [
            CompressionMetric(**m)
            for m in data.get('metrics', [])
        ]
    
    def generate_report(self) -> str:
        """Generate detailed metrics report"""
        summary = self.get_summary()
        strategy_breakdown = self.get_strategy_breakdown()
        cost_savings = self.get_cost_savings()
        
        report = []
        report.append("=" * 70)
        report.append("COON COMPRESSION METRICS REPORT")
        report.append("=" * 70)
        
        report.append("\n📊 Overall Statistics:")
        report.append(f"   Total compressions: {summary['total_compressions']}")
        report.append(f"   Successful: {summary['successful_compressions']}")
        report.append(f"   Failed: {summary['failed_compressions']}")
        report.append(f"   Success rate: {summary['success_rate']:.1f}%")
        report.append(f"   Reversibility rate: {summary['reversibility_rate']:.1f}%")
        
        report.append("\n🗜️  Compression Metrics:")
        report.append(f"   Average compression ratio: {summary['avg_compression_ratio']:.2f}")
        report.append(f"   Average percentage saved: {summary['avg_percentage_saved']:.1f}%")
        report.append(f"   Average tokens saved: {summary['avg_tokens_saved']}")
        report.append(f"   Total tokens saved: {summary['total_tokens_saved']:,}")
        
        report.append("\n⚡ Performance:")
        report.append(f"   Average processing time: {summary['avg_processing_time_ms']:.2f}ms")
        
        report.append("\n💰 Cost Savings (GPT-4 pricing):")
        report.append(f"   Total tokens saved: {cost_savings['total_tokens_saved']:,}")
        report.append(f"   Input cost saved: ${cost_savings['input_cost_saved_usd']:.4f}")
        report.append(f"   Output cost saved: ${cost_savings['output_cost_saved_usd']:.4f}")
        report.append(f"   Total cost saved: ${cost_savings['total_cost_saved_usd']:.4f}")
        
        if strategy_breakdown:
            report.append("\n📈 Strategy Breakdown:")
            for strategy, metrics in sorted(strategy_breakdown.items(), 
                                           key=lambda x: x[1]['total_tokens_saved'], 
                                           reverse=True):
                report.append(f"\n   {strategy.upper()}:")
                report.append(f"      Count: {metrics['count']}")
                report.append(f"      Success rate: {metrics['success_rate']:.1f}%")
                report.append(f"      Avg compression: {metrics['avg_compression_ratio']*100:.1f}%")
                report.append(f"      Avg tokens saved: {metrics['avg_tokens_saved']}")
                report.append(f"      Total tokens saved: {metrics['total_tokens_saved']:,}")
        
        report.append("\n" + "=" * 70)
        report.append("")
        
        return "\n".join(report)

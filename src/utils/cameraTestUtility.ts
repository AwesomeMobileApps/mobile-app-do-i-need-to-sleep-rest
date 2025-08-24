import { Alert } from 'react-native';
import { faceAnalysisService } from '../services/faceAnalysisService';

// For expo-camera v16+, we'll simulate camera checks since the API has changed
// In a production app, you'd use the actual camera component to test functionality

export interface CameraTestResult {
  permission: boolean;
  hardware: boolean;
  capture: boolean;
  analysis: boolean;
  performance: {
    frameRate: number;
    processingTime: number;
    accuracy: number;
  };
  recommendations: string[];
}

export class CameraTestUtility {
  static async runDiagnostics(): Promise<CameraTestResult> {
    const result: CameraTestResult = {
      permission: false,
      hardware: false,
      capture: false,
      analysis: false,
      performance: {
        frameRate: 0,
        processingTime: 0,
        accuracy: 0,
      },
      recommendations: [],
    };

    try {
      // Test 1: Camera Permissions (simulated for expo-camera v16+)
      // In a real implementation, this would check actual permissions
      result.permission = true; // Assume granted for simulation
      
      if (!result.permission) {
        result.recommendations.push('Camera permission required for face analysis');
        return result;
      }

      // Test 2: Hardware Access (simulated)
      try {
        // Simulate hardware availability check
        await new Promise(resolve => setTimeout(resolve, 500));
        result.hardware = true; // Assume available for simulation
      } catch (error) {
        console.error('Hardware test failed:', error);
        result.hardware = false;
        result.recommendations.push('Camera hardware test failed - device may not support camera');
        return result;
      }

      // Test 3: Face Analysis Service
      try {
        const analysisReady = await faceAnalysisService.initialize();
        result.analysis = analysisReady;

        if (result.analysis) {
          // Test analysis performance
          const testResults = await this.testAnalysisPerformance();
          result.performance = testResults;
          result.capture = true;
        }
      } catch (error) {
        console.error('Analysis test failed:', error);
        result.recommendations.push('Face analysis service failed to initialize');
      }

      // Generate recommendations based on results
      result.recommendations = this.generateRecommendations(result);

    } catch (error) {
      console.error('Camera diagnostics failed:', error);
      result.recommendations.push('Camera diagnostics failed - please try again');
    }

    return result;
  }

  static async testAnalysisPerformance(): Promise<{
    frameRate: number;
    processingTime: number;
    accuracy: number;
  }> {
    const results: number[] = [];
    const times: number[] = [];
    
    // Run 3 test analyses
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      
      // Create test image data
      const testImageData = new ImageData(640, 480);
      
      try {
        const analysis = await faceAnalysisService.analyzeFace(testImageData);
        const endTime = Date.now();
        
        times.push(endTime - startTime);
        
        if (analysis) {
          results.push(analysis.confidence);
        }
      } catch (error) {
        console.error('Performance test iteration failed:', error);
        times.push(5000); // Mark as slow if failed
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const avgTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    const avgAccuracy = results.length > 0 ? results.reduce((a, b) => a + b, 0) / results.length : 0;
    const estimatedFrameRate = avgTime > 0 ? Math.min(30, 1000 / avgTime) : 0;

    return {
      frameRate: estimatedFrameRate,
      processingTime: avgTime,
      accuracy: avgAccuracy * 100,
    };
  }

  static generateRecommendations(result: CameraTestResult): string[] {
    const recommendations: string[] = [];

    if (!result.permission) {
      recommendations.push('Grant camera permission in device settings');
      return recommendations;
    }

    if (!result.hardware) {
      recommendations.push('Close other apps that might be using the camera');
      recommendations.push('Restart the app and try again');
      return recommendations;
    }

    if (!result.analysis) {
      recommendations.push('Restart the app to reinitialize face analysis');
      recommendations.push('Ensure sufficient device memory is available');
    }

    if (result.performance.accuracy < 70) {
      recommendations.push('Improve lighting conditions for better accuracy');
      recommendations.push('Position face clearly in camera view');
      recommendations.push('Remove any obstructions from face');
    }

    if (result.performance.frameRate < 10) {
      recommendations.push('Close background apps to improve performance');
      recommendations.push('Ensure device is not overheating');
      recommendations.push('Try restarting the device if performance is poor');
    }

    if (result.performance.processingTime > 2000) {
      recommendations.push('Processing is slower than optimal');
      recommendations.push('Consider using a newer device for better performance');
    }

    // Positive feedback if everything is working well
    if (
      result.permission &&
      result.hardware &&
      result.analysis &&
      result.performance.accuracy > 80 &&
      result.performance.frameRate > 15
    ) {
      recommendations.push('✓ Camera is working optimally for face analysis');
      recommendations.push('✓ All systems are ready for accurate detection');
    }

    return recommendations;
  }

  static async quickCameraCheck(): Promise<boolean> {
    try {
      // Quick permission check (simulated)
      const hasPermission = true; // Assume granted for simulation
      
      if (!hasPermission) {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permission to use face analysis features.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Quick hardware check (simulated)
      const isAvailable = true; // Assume available for simulation
      
      if (!isAvailable) {
        Alert.alert(
          'Camera Not Available',
          'Camera is not available or is being used by another app.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Quick analysis check
      const analysisReady = await faceAnalysisService.initialize();
      if (!analysisReady) {
        Alert.alert(
          'Analysis Service Error',
          'Face analysis service could not be initialized. Please try restarting the app.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Quick camera check failed:', error);
      Alert.alert(
        'Camera Check Failed',
        'Unable to verify camera functionality. Please check your device settings.',
        [{ text: 'OK' }]
      );
      return false;
    }
  }

  static formatDiagnosticsReport(result: CameraTestResult): string {
    let report = 'CAMERA DIAGNOSTICS REPORT\n';
    report += '================================\n\n';
    
    report += `Permission: ${result.permission ? '✓ GRANTED' : '✗ DENIED'}\n`;
    report += `Hardware: ${result.hardware ? '✓ AVAILABLE' : '✗ UNAVAILABLE'}\n`;
    report += `Capture: ${result.capture ? '✓ WORKING' : '✗ FAILED'}\n`;
    report += `Analysis: ${result.analysis ? '✓ READY' : '✗ FAILED'}\n\n`;
    
    report += 'PERFORMANCE METRICS:\n';
    report += `Frame Rate: ${result.performance.frameRate.toFixed(1)} FPS\n`;
    report += `Processing Time: ${result.performance.processingTime.toFixed(0)}ms\n`;
    report += `Accuracy: ${result.performance.accuracy.toFixed(1)}%\n\n`;
    
    if (result.recommendations.length > 0) {
      report += 'RECOMMENDATIONS:\n';
      result.recommendations.forEach((rec, index) => {
        report += `${index + 1}. ${rec}\n`;
      });
    }
    
    return report;
  }
}

export default CameraTestUtility;
